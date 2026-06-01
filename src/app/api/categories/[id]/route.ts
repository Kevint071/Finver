import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/session";
import { requireRole } from "@/server/dal";
import { updateCategory, deactivateCategory } from "@/server/services/category.service";
import { createAuditLog } from "@/server/services/audit.service";
import { updateCategorySchema } from "@/lib/validations";
import { MemberRole, EventType } from "@/generated/prisma";

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

    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: z.flattenError(parsed.error).fieldErrors },
        { status: 400 }
      );
    }

    const category = await updateCategory(id, parsed.data.name);

    await createAuditLog(
      membership.groupId,
      user.id!,
      EventType.CATEGORY_EDITED,
      `Categoría "${category.name}" editada`
    );

    return NextResponse.json(category);
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
    const [user, membership, { id }] = await Promise.all([
      requireAuth(),
      requireRole([MemberRole.OWNER, MemberRole.ADMIN]),
      params,
    ]);

    const category = await deactivateCategory(id);

    await createAuditLog(
      membership.groupId,
      user.id!,
      EventType.CATEGORY_DEACTIVATED,
      `Categoría "${category.name}" desactivada`
    );

    return NextResponse.json(category);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
