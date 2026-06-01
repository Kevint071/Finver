import { requireAuth } from "@/lib/session";
import { requireGroupMembership } from "@/server/dal";
import { getAuditLogs } from "@/server/services/audit.service";
import { ActivityClient } from "@/features/activity/activity-client";

export default async function ActivityPage() {
  await requireAuth();
  const membership = await requireGroupMembership();

  const logs = await getAuditLogs(membership.groupId, { take: 100 });

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-zinc-50">Actividad</h1>
      <ActivityClient logs={logs} />
    </div>
  );
}
