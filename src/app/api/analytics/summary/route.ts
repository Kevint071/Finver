import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { requireGroupMembership } from "@/server/dal";
import { getDashboardSummary, getMonthlyAnalytics } from "@/server/services/analytics.service";

export async function GET() {
  try {
    await requireAuth();
    const membership = await requireGroupMembership();

    const [summary, monthly] = await Promise.all([
      getDashboardSummary(membership.groupId),
      getMonthlyAnalytics(membership.groupId),
    ]);

    return NextResponse.json({ ...summary, ...monthly });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
