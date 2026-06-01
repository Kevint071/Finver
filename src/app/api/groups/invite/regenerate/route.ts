import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { requireRole } from "@/server/dal";
import { regenerateInviteCode } from "@/server/services/group.service";
import { MemberRole } from "@/generated/prisma";

export async function POST() {
  try {
    await requireAuth();
    const membership = await requireRole([MemberRole.OWNER, MemberRole.ADMIN]);
    const group = await regenerateInviteCode(membership.groupId);
    return NextResponse.json({ inviteCode: group.inviteCode });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
