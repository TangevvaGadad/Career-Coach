import { NextResponse } from "next/server";
import { generateJobOpportunities } from "@/actions/dashboard";
import { db } from "@/lib/prisma";

export async function POST() {
  try {
    console.log("🚀 Manual job opportunities update triggered...");
    
    // Get all industries from the database
    const industries = await db.industryInsight.findMany({
      select: { industry: true },
    });
    
    if (industries.length === 0) {
      return NextResponse.json({ 
        error: "No industries found. Please complete onboarding first." 
      }, { status: 400 });
    }
    
    const results = [];
    
    // Update job opportunities for each industry
    for (const { industry } of industries) {
      console.log(`📊 Updating job opportunities for ${industry}...`);
      
      try {
        // Deactivate old jobs
        await db.jobOpportunity.updateMany({
          where: {
            industry: industry,
            isActive: true,
          },
          data: {
            isActive: false,
          },
        });
        
        // Generate new job opportunities
        const jobData = await generateJobOpportunities(industry);
        
        if (jobData.jobs && Array.isArray(jobData.jobs)) {
          // Create new job opportunities
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
          
          results.push({
            industry,
            jobsCreated: jobData.jobs.length,
            status: "success"
          });
        }
      } catch (error) {
        console.error(`❌ Error updating jobs for ${industry}:`, error);
        results.push({
          industry,
          error: error instanceof Error ? error.message : "Unknown error",
          status: "error"
        });
      }
    }
    
    console.log("✅ Job opportunities update completed!");
    
    return NextResponse.json({
      message: "Job opportunities updated successfully",
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Error in manual job update:", error);
    return NextResponse.json({ 
      error: "Failed to update job opportunities",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
