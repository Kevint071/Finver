import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { requireGroupMembership, requireRole } from "@/server/dal";
import { createGroupSchema } from "@/lib/validations";
import { createGroup, getGroupWithMembers } from "@/server/services/group.service";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = createGroupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const group = await createGroup(parsed.data.name, user.id!);
    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  try {
    await requireAuth();
    const membership = await requireGroupMembership();
    const group = await getGroupWithMembers(membership.groupId);
    return NextResponse.json(group);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
