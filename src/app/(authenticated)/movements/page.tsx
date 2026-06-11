import { requireGroupMembership } from "@/server/dal";
import { getMovements } from "@/server/services/movement.service";
import { MovementsClient } from "@/features/movements/movements-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movimientos - Finver",
  description: "Registro de ingresos y gastos del grupo",
};

export default async function MovementsPage() {
  const membership = await requireGroupMembership();

  const rawMovements = await getMovements(membership.groupId, { take: 100 });
  const movements = rawMovements.map((m) => ({
    ...m,
    movementDate: m.movementDate.toISOString(),
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-zinc-50">Movimientos</h1>
      <MovementsClient movements={movements} />
    </div>
  );
}
