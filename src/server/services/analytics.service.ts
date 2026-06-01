import { prisma } from "@/lib/prisma";
import { MovementType } from "@/generated/prisma";

export async function getDashboardSummary(groupId: string) {
  const [incomeResult, expenseResult] = await Promise.all([
    prisma.movement.aggregate({
      where: { groupId, type: MovementType.INCOME },
      _sum: { amount: true },
    }),
    prisma.movement.aggregate({
      where: { groupId, type: MovementType.EXPENSE },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = incomeResult._sum.amount ?? 0;
  const totalExpense = expenseResult._sum.amount ?? 0;
  const balance = totalIncome - totalExpense;

  return { balance, totalIncome, totalExpense };
}

export async function getMonthlyAnalytics(groupId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [monthlyIncome, monthlyExpense] = await Promise.all([
    prisma.movement.aggregate({
      where: {
        groupId,
        type: MovementType.INCOME,
        movementDate: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.movement.aggregate({
      where: {
        groupId,
        type: MovementType.EXPENSE,
        movementDate: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    monthlyIncome: monthlyIncome._sum.amount ?? 0,
    monthlyExpense: monthlyExpense._sum.amount ?? 0,
  };
}

export async function getExpensesByCategory(groupId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const expenses = await prisma.movement.groupBy({
    by: ["categoryId"],
    where: {
      groupId,
      type: MovementType.EXPENSE,
      movementDate: { gte: startOfMonth, lte: endOfMonth },
    },
    _sum: { amount: true },
  });

  const categoryIds = expenses.map((e) => e.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
  });

  return expenses.map((e) => ({
    categoryId: e.categoryId,
    categoryName: categories.find((c) => c.id === e.categoryId)?.name ?? "Unknown",
    total: e._sum.amount ?? 0,
  }));
}
