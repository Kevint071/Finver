import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/session";
import { requireGroupMembership } from "@/server/dal";
import { createGroupSchema } from "@/lib/validations";
import { createGroup, getGroupWithMembers } from "@/server/services/group.service";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = createGroupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: z.flattenError(parsed.error).fieldErrors },
        { status: 400 }
      );
    }

    const group = await createGroup(parsed.data.name, user.id!);

    // Set as active group
    const cookieStore = await cookies();
    cookieStore.set("finver-active-group", group.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });

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
