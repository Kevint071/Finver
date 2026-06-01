import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { requireRole } from "@/server/dal";
import { updateGroupName } from "@/server/services/group.service";
import { updateGroupSchema } from "@/lib/validations";
import { MemberRole } from "@/generated/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const membership = await requireRole([MemberRole.OWNER]);
    const { id } = await params;

    if (membership.groupId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateGroupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const group = await updateGroupName(id, parsed.data.name);
    return NextResponse.json(group);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
