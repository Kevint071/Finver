import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { requireGroupMembership } from "@/server/dal";
import { getExpensesByCategory } from "@/server/services/analytics.service";

export async function GET() {
  try {
    await requireAuth();
    const membership = await requireGroupMembership();
    const data = await getExpensesByCategory(membership.groupId);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
