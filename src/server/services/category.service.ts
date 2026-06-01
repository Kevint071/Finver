import { prisma } from "@/lib/prisma";

export async function createCategory(
  groupId: string,
  name: string,
  createdBy: string
) {
  return prisma.category.create({
    data: { groupId, name, createdBy },
  });
}

export async function updateCategory(categoryId: string, name: string) {
  return prisma.category.update({
    where: { id: categoryId },
    data: { name },
  });
}

export async function deactivateCategory(categoryId: string) {
  return prisma.category.update({
    where: { id: categoryId },
    data: { isActive: false },
  });
}

export async function getActiveCategories(groupId: string) {
  return prisma.category.findMany({
    where: { groupId, isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function getAllCategories(groupId: string) {
  return prisma.category.findMany({
    where: { groupId },
    orderBy: { name: "asc" },
  });
}
