import { getDashboardSummary, getMonthlyAnalytics } from "@/server/services/analytics.service";
import { getMovements } from "@/server/services/movement.service";
import { getActiveCategories } from "@/server/services/category.service";
import { DashboardClient } from "./dashboard-client";

interface DashboardProps {
  groupId: string;
  groupName: string;
}

export async function Dashboard({ groupId, groupName }: DashboardProps) {
  const [summary, monthly, recentMovements, categories] = await Promise.all([
    getDashboardSummary(groupId),
    getMonthlyAnalytics(groupId),
    getMovements(groupId, { take: 10 }),
    getActiveCategories(groupId),
  ]);

  const serializedMovements = recentMovements.map((m) => ({
    id: m.id,
    type: m.type,
    amount: m.amount,
    description: m.description,
    movementDate: m.movementDate.toISOString(),
    category: { id: m.category.id, name: m.category.name },
    creator: { id: m.creator.id, name: m.creator.name, image: m.creator.image },
  }));

  return (
    <DashboardClient
      groupName={groupName}
      balance={summary.balance}
      totalIncome={summary.totalIncome}
      totalExpense={summary.totalExpense}
      monthlyIncome={monthly.monthlyIncome}
      monthlyExpense={monthly.monthlyExpense}
      recentMovements={serializedMovements}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
