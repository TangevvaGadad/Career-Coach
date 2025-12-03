"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Helper function to try multiple models with fallback + basic rate-limit handling
async function generateWithModelFallback(prompt: string) {
  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
    "gemini-2.0-flash-exp"
  ];

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const content = result.response.text().trim();
      console.log(`✅ Successfully used model: ${modelName}`);
      return content;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStatus = (error as { status?: number })?.status;

      // If it's a 404, try the next model
      if (errorMessage.includes('404') || errorStatus === 404) {
        console.log(`⚠️ Model ${modelName} not available, trying next...`);
        continue;
      }

      // If it's a 429 (rate limited), wait briefly then try the NEXT model
      if (errorMessage.includes('429') || errorStatus === 429) {
        const delayMs = 2000;
        console.warn(`⏳ Rate limited on model ${modelName} (429). Waiting ${delayMs}ms before trying another model...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      // For other errors, log and try next model
      console.error(`Error with model ${modelName}:`, error);
      continue;
    }
  }

  throw new Error("All Gemini models failed");
}

// Define the input type
interface CoverLetterInput {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
}

// Generate cover letter
export async function generateCoverLetter(data: CoverLetterInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    Write a professional cover letter for a ${data.jobTitle} position at ${data.companyName}.
    
    About the candidate:
    - Industry: ${user.industry}
    - Years of Experience: ${user.experience}
    - Skills: ${user.skills?.join(", ")}
    - Professional Background: ${user.bio}
    
    Job Description:
    ${data.jobDescription}
    
    Requirements:
    1. Use a professional, enthusiastic tone
    2. Highlight relevant skills and experience
    3. Show understanding of the company's needs
    4. Keep it concise (max 400 words)
    5. Use proper business letter formatting in markdown
    6. Include specific examples of achievements
    7. Relate candidate's background to job requirements
    
    Format the letter in markdown.
  `;

  try {
    const content = await generateWithModelFallback(prompt);

    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        status: "completed",
        userId: user.id,
      },
    });

    return coverLetter;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error generating cover letter with Gemini:", errorMessage);

    // Graceful fallback: generate a simple template-based cover letter
    const fallbackContent = `
Dear Hiring Manager,

I am writing to express my interest in the ${data.jobTitle} role at ${data.companyName}. With a background in ${user.industry ?? "your industry"} and experience of ${user.experience ?? "relevant projects and internships"}, I have developed skills in ${(user.skills ?? []).join(", ") || "relevant technical and professional skills"} that align well with this opportunity.

In my recent work, I have been involved in:
- ${user.bio || "handling responsibilities that strengthened my problem-solving, collaboration, and learning mindset."}

I am excited about the possibility of contributing to ${data.companyName} and growing with your team. I would welcome the opportunity to discuss how my background can add value to this position.

Thank you for considering my application.

Sincerely,
[Your Name]
`.trim();

    const coverLetter = await db.coverLetter.create({
      data: {
        content: fallbackContent,
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        status: "completed",
        userId: user.id,
      },
    });

    return coverLetter;
  }
}

// Get all cover letters for the logged-in user
export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// Get a specific cover letter by ID
export async function getCoverLetter(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });
}

// Delete a cover letter
export async function deleteCoverLetter(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.delete({
    where: {
      id,
      userId: user.id,
    },
  });
}
