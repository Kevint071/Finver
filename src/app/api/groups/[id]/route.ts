import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/session";
import { requireRole } from "@/server/dal";
import { renameGroup, deleteGroup } from "@/server/services/group.service";
import { updateGroupSchema } from "@/lib/validations";
import { MemberRole } from "@/generated/prisma";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, membership, { id }] = await Promise.all([
      requireAuth(),
      requireRole([MemberRole.OWNER, MemberRole.ADMIN]),
      params,
    ]);

    if (membership.groupId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateGroupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: z.flattenError(parsed.error).fieldErrors },
        { status: 400 }
      );
    }

    const group = await renameGroup(id, parsed.data.name, user.id!);
    return NextResponse.json(group);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, { id }] = await Promise.all([requireAuth(), params]);

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: user.id! } },
    });

    if (!membership || membership.role !== MemberRole.OWNER) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteGroup(id, user.id!);

    // Clear active group cookie if it was the deleted group
    const cookieStore = await cookies();
    const activeGroup = cookieStore.get("finver-active-group");
    if (activeGroup?.value === id) {
      cookieStore.delete("finver-active-group");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
