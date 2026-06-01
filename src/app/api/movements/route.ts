import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { requireGroupMembership } from "@/server/dal";
import { createMovement, getMovements } from "@/server/services/movement.service";
import { createAuditLog } from "@/server/services/audit.service";
import { createMovementSchema } from "@/lib/validations";
import { EventType } from "@/generated/prisma";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const membership = await requireGroupMembership();

    const { searchParams } = new URL(request.url);
    const take = Number(searchParams.get("take")) || 50;
    const skip = Number(searchParams.get("skip")) || 0;

    const movements = await getMovements(membership.groupId, { take, skip });
    return NextResponse.json(movements);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const membership = await requireGroupMembership();

    const body = await request.json();
    const parsed = createMovementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const movement = await createMovement({
      groupId: membership.groupId,
      categoryId: parsed.data.categoryId,
      createdByUserId: user.id!,
      type: parsed.data.type,
      amount: parsed.data.amount,
      description: parsed.data.description,
      movementDate: new Date(parsed.data.movementDate),
    });

    await createAuditLog(
      membership.groupId,
      user.id!,
      EventType.MOVEMENT_CREATED,
      `Movimiento ${parsed.data.type === "INCOME" ? "ingreso" : "gasto"} de $${parsed.data.amount} creado`
    );

    return NextResponse.json(movement, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
