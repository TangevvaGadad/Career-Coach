import { getIndustryInsights, getJobOpportunities } from "@/actions/dashboard";
import DashboardView from "./_components/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { isOnboarded, user } = await getUserOnboardingStatus();

  // If not onboarded, redirect to onboarding page
  // Skip this check if already on the onboarding page
  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const insights = await getIndustryInsights();
  const jobOpportunities = user?.industry ? await getJobOpportunities(user.industry) : [];

  return (
    <div className="container mx-auto">
      <DashboardView insights={insights} jobOpportunities={jobOpportunities} />
    </div>
  );
}