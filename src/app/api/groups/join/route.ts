import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { joinGroupSchema } from "@/lib/validations";
import { joinGroup } from "@/server/services/group.service";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = joinGroupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await joinGroup(parsed.data.inviteCode, user.id!);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
