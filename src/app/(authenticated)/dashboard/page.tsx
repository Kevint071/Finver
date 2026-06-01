import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Dashboard } from "@/features/dashboard/dashboard";
import { OnboardingPage } from "@/features/onboarding/onboarding-page";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const membership = await prisma.groupMember.findFirst({
    where: { userId: session.user.id },
    include: { group: true },
  });

  if (!membership) {
    return <OnboardingPage />;
  }

  return <Dashboard groupId={membership.groupId} groupName={membership.group.name} />;
}
