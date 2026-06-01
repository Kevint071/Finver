import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { leaveGroup } from "@/server/services/group.service";
import { cookies } from "next/headers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    await leaveGroup(id, user.id!);

    // Clear active group cookie if it was the left group
    const cookieStore = await cookies();
    const activeGroup = cookieStore.get("finver-active-group");
    if (activeGroup?.value === id) {
      cookieStore.delete("finver-active-group");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
