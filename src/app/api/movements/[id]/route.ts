import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { requireGroupMembership } from "@/server/dal";
import {
  getMovementById,
  updateMovement,
  deleteMovement,
} from "@/server/services/movement.service";
import { createAuditLog } from "@/server/services/audit.service";
import { updateMovementSchema } from "@/lib/validations";
import { EventType, MemberRole } from "@/generated/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const membership = await requireGroupMembership();
    const { id } = await params;

    const existing = await getMovementById(id);
    if (!existing || existing.groupId !== membership.groupId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check permission: creator, admin, or owner
    const canEdit =
      existing.createdByUserId === user.id ||
      membership.role === MemberRole.ADMIN ||
      membership.role === MemberRole.OWNER;

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateMovementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updateData = {
      ...parsed.data,
      movementDate: parsed.data.movementDate
        ? new Date(parsed.data.movementDate)
        : undefined,
    };

    const movement = await updateMovement(id, updateData);

    await createAuditLog(
      membership.groupId,
      user.id!,
      EventType.MOVEMENT_EDITED,
      `Movimiento editado (ID: ${id})`
    );

    return NextResponse.json(movement);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const membership = await requireGroupMembership();
    const { id } = await params;

    const existing = await getMovementById(id);
    if (!existing || existing.groupId !== membership.groupId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const canDelete =
      existing.createdByUserId === user.id ||
      membership.role === MemberRole.ADMIN ||
      membership.role === MemberRole.OWNER;

    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteMovement(id);

    await createAuditLog(
      membership.groupId,
      user.id!,
      EventType.MOVEMENT_DELETED,
      `Movimiento eliminado (${existing.type === "INCOME" ? "ingreso" : "gasto"} de $${existing.amount})`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
