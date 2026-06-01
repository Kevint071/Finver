import { requireAuth } from "@/lib/session";
import { requireGroupMembership } from "@/server/dal";
import { getMovements } from "@/server/services/movement.service";
import { MovementsClient } from "@/features/movements/movements-client";

export default async function MovementsPage() {
  await requireAuth();
  const membership = await requireGroupMembership();

  const movements = await getMovements(membership.groupId, { take: 100 });

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-zinc-50">Movimientos</h1>
      <MovementsClient movements={movements} />
    </div>
  );
}
