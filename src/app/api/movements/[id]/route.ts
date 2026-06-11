import { NextResponse } from "next/server";
import { z } from "zod";
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
    const [user, membership, { id }] = await Promise.all([
      requireAuth(),
      requireGroupMembership(),
      params,
    ]);

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
        { error: z.flattenError(parsed.error).fieldErrors },
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

    const changedFields: string[] = [];
    if (parsed.data.amount !== undefined && parsed.data.amount !== existing.amount) {
      changedFields.push("monto");
    }
    if (parsed.data.categoryId !== undefined && parsed.data.categoryId !== existing.categoryId) {
      changedFields.push("categoría");
    }
    if (parsed.data.description !== undefined && parsed.data.description !== existing.description) {
      changedFields.push("descripción");
    }
    if (parsed.data.movementDate && new Date(parsed.data.movementDate).toDateString() !== existing.movementDate.toDateString()) {
      changedFields.push("fecha");
    }

    const changedSummary = changedFields.length > 0
      ? `Campos modificados: ${changedFields.join(", ")}`
      : "Sin cambios detectados";

    await createAuditLog(
      membership.groupId,
      user.id!,
      EventType.MOVEMENT_EDITED,
      `Movimiento editado — ${changedSummary}`
    );

    if (parsed.data.movementDate && new Date(parsed.data.movementDate).toDateString() !== existing.movementDate.toDateString()) {
      const oldDate = existing.movementDate.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
      const newDate = new Date(parsed.data.movementDate).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
      await createAuditLog(
        membership.groupId,
        user.id!,
        EventType.MOVEMENT_DATE_CHANGED,
        `Fecha de movimiento cambiada: ${oldDate} → ${newDate}`
      );
    }

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
    const [user, membership, { id }] = await Promise.all([
      requireAuth(),
      requireGroupMembership(),
      params,
    ]);

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
