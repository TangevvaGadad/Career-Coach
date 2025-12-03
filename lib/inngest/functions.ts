import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure the API key is defined
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in the environment.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Helper function to try multiple models with fallback
async function generateWithModelFallback(prompt: string): Promise<string> {
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
      const response = result.response;
      const text = response.text();
      console.log(`✅ Successfully used model: ${modelName}`);
      return text;
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

  throw new Error("All Gemini models failed");
}

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
      id: "generate-industry-insights"
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

      const text = await step.run(`Generate insights for ${industry}`, async () => {
        return await generateWithModelFallback(prompt);
      });

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

export const fetchJobOpportunities = inngest.createFunction(
  {
    name: "Fetch Job Opportunities",
    id: "fetch-job-opportunities"
  },
  { cron: "0 6 * * *" }, // Every day at 6 AM
  async ({ step }) => {
    const industries = await step.run("Fetch industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    for (const { industry } of industries) {
      const prompt = `
        Search for current job opportunities and internships in the ${industry} industry from platforms like Internshala, Unstop, LinkedIn, Indeed, and other job portals. 
        
        Return the data in ONLY the following JSON format without any additional notes or explanations:
        {
          "jobs": [
            {
              "title": "string",
              "company": "string", 
              "location": "string",
              "type": "internship" | "full-time" | "part-time" | "contract",
              "description": "string",
              "requirements": ["requirement1", "requirement2"],
              "skills": ["skill1", "skill2"],
              "salary": "string (e.g., '₹15,000 - ₹25,000/month' or 'Not specified')",
              "experience": "string (e.g., '0-2 years', 'Fresher', '2-5 years')",
              "platform": "internshala" | "unstop" | "linkedin" | "indeed" | "other",
              "url": "string (job posting URL)",
              "postedDate": "YYYY-MM-DD",
              "deadline": "YYYY-MM-DD (if available, otherwise null)"
            }
          ]
        }
        
        IMPORTANT: 
        - Return ONLY the JSON. No additional text, notes, or markdown formatting.
        - Include at least 8-10 current job opportunities
        - Focus on internships and entry-level positions for students
        - Include a mix of different job types (internships, full-time, part-time)
        - Make sure URLs are realistic job posting URLs
        - Use current dates for postedDate
        - Include diverse companies and locations
        - Ensure all required fields are populated
      `;

      const text = await step.run(`Generate insights for ${industry}`, async () => {
        return await generateWithModelFallback(prompt);
      });

      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

      try {
        const jobData = JSON.parse(cleanedText);
        
        // Deactivate old jobs for this industry
        await step.run(`Deactivate old jobs for ${industry}`, async () => {
          await db.jobOpportunity.updateMany({
            where: {
              industry: industry,
              isActive: true,
            },
            data: {
              isActive: false,
            },
          });
        });

        // Create new job opportunities
        if (jobData.jobs && Array.isArray(jobData.jobs)) {
          await step.run(`Create new jobs for ${industry}`, async () => {
            for (const job of jobData.jobs) {
              await db.jobOpportunity.create({
                data: {
                  title: job.title,
                  company: job.company,
                  location: job.location,
                  type: job.type,
                  industry: industry,
                  description: job.description,
                  requirements: job.requirements || [],
                  skills: job.skills || [],
                  salary: job.salary,
                  experience: job.experience,
                  platform: job.platform,
                  url: job.url,
                  postedDate: new Date(job.postedDate),
                  deadline: job.deadline ? new Date(job.deadline) : null,
                },
              });
            }
          });
        }
      } catch (error) {
        console.error(`Failed to parse job data for industry "${industry}":`, error);
      }
    }
  }
);
