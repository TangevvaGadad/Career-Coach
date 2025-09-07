import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure the API key is defined
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in the environment.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Define the structure of the expected response
interface SalaryRange {
  role: string;
  min: number;
  max: number;
  median: number;
  location: string;
}

interface IndustryInsightJSON {
  salaryRanges: SalaryRange[];
  growthRate: number;
  demandLevel: "High" | "Medium" | "Low";
  topSkills: string[];
  marketOutlook: "Positive" | "Neutral" | "Negative";
  keyTrends: string[];
  recommendedSkills: string[];
}

export const generateIndustryInsights = inngest.createFunction(
  {
      name: "Generate Industry Insights",
      id: ""
  },
  { cron: "0 0 * * 0" }, // Every Sunday at midnight
  async ({ step }) => {
    const industries = await step.run("Fetch industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    for (const { industry } of industries) {
      const prompt = `
        Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
        {
          "salaryRanges": [
            { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
          ],
          "growthRate": number,
          "demandLevel": "High" | "Medium" | "Low",
          "topSkills": ["skill1", "skill2"],
          "marketOutlook": "Positive" | "Neutral" | "Negative",
          "keyTrends": ["trend1", "trend2"],
          "recommendedSkills": ["skill1", "skill2"]
        }

        IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
        Include at least 5 common roles for salary ranges.
        Growth rate should be a percentage.
        Include at least 5 skills and trends.
      `;

      const res = await step.ai.wrap(
        "gemini",
        async (p) => {
          return await model.generateContent(p);
        },
        prompt
      );

      const part = res.response.candidates?.[0]?.content?.parts?.[0];
      const text = typeof part === "object" && "text" in part ? part.text : "";
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
      

      try {
        const insights: IndustryInsightJSON = JSON.parse(cleanedText);

        await step.run(`Update ${industry} insights`, async () => {
            await db.industryInsight.update({
              where: { industry },
              data: {
                ...insights,
                salaryRanges: JSON.parse(JSON.stringify(insights.salaryRanges)),  // Make sure it's a valid JSON
                lastUpdated: new Date(),
                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // +7 days
              },
            });
          });
      } catch (error) {
        console.error(`Failed to parse JSON for industry "${industry}":`, error);
      }
    }
  }
);
