import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { requireGroupMembership } from "@/server/dal";
import { getAuditLogs } from "@/server/services/audit.service";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const membership = await requireGroupMembership();

    const { searchParams } = new URL(request.url);
    const take = Number(searchParams.get("take")) || 50;
    const skip = Number(searchParams.get("skip")) || 0;

    const logs = await getAuditLogs(membership.groupId, { take, skip });
    return NextResponse.json(logs);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
