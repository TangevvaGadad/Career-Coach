import { inngest } from "@/lib/inngest/client";

// Manual trigger script for Inngest functions
async function triggerJobOpportunities() {
  console.log("🚀 Triggering job opportunities fetch...");
  
  try {
    await inngest.send({
      name: "inngest/function.failed",
      data: {
        function_id: "fetch-job-opportunities",
        error: "Manual trigger",
      },
    });
    
    // Trigger the function directly
    await inngest.send({
      name: "inngest/function.scheduled",
      data: {
        function_id: "fetch-job-opportunities",
        cron: "0 6 * * *",
      },
    });
    
    console.log("✅ Job opportunities fetch triggered successfully!");
  } catch (error) {
    console.error("❌ Error triggering job opportunities fetch:", error);
  }
}

async function triggerIndustryInsights() {
  console.log("🚀 Triggering industry insights generation...");
  
  try {
    await inngest.send({
      name: "inngest/function.scheduled",
      data: {
        function_id: "generate-industry-insights",
        cron: "0 0 * * 0",
      },
    });
    
    console.log("✅ Industry insights generation triggered successfully!");
  } catch (error) {
    console.error("❌ Error triggering industry insights generation:", error);
  }
}

// Run the functions
async function main() {
  console.log("🎯 Starting manual Inngest function triggers...");
  
  await triggerJobOpportunities();
  await triggerIndustryInsights();
  
  console.log("🎉 All functions triggered successfully!");
}

main().catch(console.error);
