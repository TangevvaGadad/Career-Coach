"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

// Check for GEMINI API key
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

// Improve resume section with Gemini AI
export async function improveWithAI(params: { current: string; type: string }) {
  const { current, type } = params;

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
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

  // Try multiple models with fallback
  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
    "gemini-2.0-flash-exp"
  ];

  for (const modelName of modelsToTry) {
    try {
      const testModel = genAI.getGenerativeModel({ model: modelName });
      const result = await testModel.generateContent(prompt);
      const response = result.response;
      const improvedContent = response.text().trim();

      console.log(`✅ Successfully used model: ${modelName}`);
      return improvedContent;
    } catch (error: unknown) {
      // If it's a 404, try the next model
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStatus = (error as { status?: number })?.status;
      if (errorMessage.includes('404') || errorStatus === 404) {
        console.log(`⚠️ Model ${modelName} not available, trying next...`);
        continue;
      }
      // For other errors, log and try next model
      console.error(`Error with model ${modelName}:`, error);
      continue;
    }
  }

  // If all models failed, return original content with a note
  console.error("❌ All Gemini models failed. Returning original content.");
  return current;
}
