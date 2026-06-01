import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/session";
import { requireRole, requireGroupMembership } from "@/server/dal";
import { createCategory, getActiveCategories } from "@/server/services/category.service";
import { createAuditLog } from "@/server/services/audit.service";
import { createCategorySchema } from "@/lib/validations";
import { MemberRole, EventType } from "@/generated/prisma";

export async function GET() {
  try {
    const [, membership] = await Promise.all([requireAuth(), requireGroupMembership()]);
    const categories = await getActiveCategories(membership.groupId);
    return NextResponse.json(categories);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const [user, membership] = await Promise.all([
      requireAuth(),
      requireRole([MemberRole.OWNER, MemberRole.ADMIN]),
    ]);

    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: z.flattenError(parsed.error).fieldErrors },
        { status: 400 }
      );
    }

    const category = await createCategory(
      membership.groupId,
      parsed.data.name,
      user.id!
    );

    await createAuditLog(
      membership.groupId,
      user.id!,
      EventType.CATEGORY_CREATED,
      `Categoría "${category.name}" creada`
    );

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
