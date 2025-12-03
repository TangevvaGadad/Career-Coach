"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing Gemini API key");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Save or update resume
export async function saveResume(content: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const resume = await db.resume.upsert({
      where: {
        userId: user.id,
      },
      update: {
        content,
      },
      create: {
        userId: user.id,
        content,
      },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

// Get resume content
export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.resume.findUnique({
    where: {
      userId: user.id,
    },
  });
}

async function generateWithModelFallback(prompt: string) {
  const modelsToTry = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
  ];

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const content = result.response.text().trim();
      console.log(`✅ Successfully used model: ${modelName}`);
      return content;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const status = (error as { status?: number })?.status;

      if (message.includes("404") || status === 404) {
        console.log(`⚠️ Model ${modelName} not available, trying next...`);
        continue;
      }

      if (message.includes("429") || status === 429) {
        const delayMs = 2000;
        console.warn(`⏳ Rate limited on model ${modelName}. Waiting ${delayMs}ms before trying another model...`);
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }

      if (message.includes("PERMISSION_DENIED") || status === 403) {
        console.error("Gemini API key not authorized for this request.");
        continue;
      }

      console.error(`Error with model ${modelName}:`, error);
      continue;
    }
  }

  throw new Error("All Gemini models failed");
}

export async function improveWithAI(params: { current: string; type: string }) {
  const { current, type } = params;

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { industryInsight: true },
  });

  if (!user) throw new Error("User not found");

  const industry = user.industry || "general";

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords

    Respond strictly with the rewritten content only, no preamble or explanations.
    Format the response as a single paragraph.
  `;

  try {
    const content = await generateWithModelFallback(prompt);
    return content;
  } catch {
    console.error("❌ All Gemini models failed. Returning original content.");
    return current;
  }
}
