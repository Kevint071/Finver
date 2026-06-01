import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Dashboard } from "@/features/dashboard/dashboard";
import { OnboardingPage } from "@/features/onboarding/onboarding-page";
import { getCurrentUserMembership } from "@/server/dal";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const membership = await getCurrentUserMembership();

  if (!membership) {
    return <OnboardingPage />;
  }

  return <Dashboard groupId={membership.groupId} groupName={membership.group.name} />;
}
