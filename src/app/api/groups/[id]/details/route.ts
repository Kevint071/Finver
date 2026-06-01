import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { getGroupDetails } from "@/server/services/group.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const details = await getGroupDetails(id, user.id!);
    return NextResponse.json(details);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
