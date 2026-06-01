import { prisma } from "@/lib/prisma";
import { MovementType } from "@/generated/prisma";

interface CreateMovementInput {
  groupId: string;
  categoryId: string;
  createdByUserId: string;
  type: MovementType;
  amount: number;
  description?: string;
  movementDate: Date;
}

interface UpdateMovementInput {
  categoryId?: string;
  type?: MovementType;
  amount?: number;
  description?: string;
  movementDate?: Date;
}

export async function createMovement(input: CreateMovementInput) {
  // Verify category is active
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
  });

  if (!category || !category.isActive) {
    throw new Error("Category is not active");
  }

  return prisma.movement.create({
    data: {
      groupId: input.groupId,
      categoryId: input.categoryId,
      createdByUserId: input.createdByUserId,
      type: input.type,
      amount: input.amount,
      description: input.description ?? null,
      movementDate: input.movementDate,
    },
    include: {
      category: true,
      creator: { select: { id: true, name: true, image: true } },
    },
  });
}

export async function updateMovement(
  movementId: string,
  input: UpdateMovementInput
) {
  if (input.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
    });
    if (!category || !category.isActive) {
      throw new Error("Category is not active");
    }
  }

  return prisma.movement.update({
    where: { id: movementId },
    data: input,
    include: {
      category: true,
      creator: { select: { id: true, name: true, image: true } },
    },
  });
}

export async function deleteMovement(movementId: string) {
  return prisma.movement.delete({
    where: { id: movementId },
  });
}

export async function getMovements(
  groupId: string,
  options?: { take?: number; skip?: number }
) {
  return prisma.movement.findMany({
    where: { groupId },
    include: {
      category: true,
      creator: { select: { id: true, name: true, image: true } },
    },
    orderBy: { movementDate: "desc" },
    take: options?.take,
    skip: options?.skip,
  });
}

export async function getMovementById(movementId: string) {
  return prisma.movement.findUnique({
    where: { id: movementId },
    include: {
      category: true,
      creator: { select: { id: true, name: true, image: true } },
    },
  });
}
