import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(50, "Máximo 50 caracteres"),
});

export const joinGroupSchema = z.object({
  inviteCode: z.string().min(1, "El código es requerido"),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(50, "Máximo 50 caracteres"),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(30, "Máximo 30 caracteres"),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(30, "Máximo 30 caracteres"),
});

export const createMovementSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "La categoría es requerida"),
  amount: z.number().int().positive("El monto debe ser positivo"),
  description: z.string().max(200, "Máximo 200 caracteres").optional(),
  movementDate: z.string().datetime().or(z.string().date()),
});

export const updateMovementSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  categoryId: z.string().min(1).optional(),
  amount: z.number().int().positive("El monto debe ser positivo").optional(),
  description: z.string().max(200, "Máximo 200 caracteres").optional(),
  movementDate: z.string().datetime().or(z.string().date()).optional(),
});

export const changeRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export const transferOwnershipSchema = z.object({
  newOwnerId: z.string().min(1),
});
