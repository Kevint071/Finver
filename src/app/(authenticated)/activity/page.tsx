import { requireAuth } from "@/lib/session";
import { requireGroupMembership } from "@/server/dal";
import { getAuditLogs } from "@/server/services/audit.service";
import { ActivityClient } from "@/features/activity/activity-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Actividad - Finver",
  description: "Historial de actividad del grupo",
};

export default async function ActivityPage() {
  await requireAuth();
  const membership = await requireGroupMembership();

  const rawLogs = await getAuditLogs(membership.groupId, { take: 100 });
  const logs = rawLogs.map((log) => ({
    ...log,
    createdAt: log.createdAt.toISOString(),
  }));

  return (
    <div>
      <ActivityClient logs={logs} />
    </div>
  );
}
