import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { GroupsClient } from "@/features/groups/groups-client";
import { getUserMemberships, getActiveGroupId } from "@/server/dal";
import { NoGroupState } from "@/features/groups/no-group-state";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grupos - Finver",
  description: "Administra tus grupos familiares",
};

export default async function GroupsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const [memberships, activeGroupId] = await Promise.all([
    getUserMemberships(),
    getActiveGroupId(),
  ]);

  if (memberships.length === 0) {
    return (
      <NoGroupState
        title="Sin grupo"
        description="Aún no perteneces a ningún grupo. Crea uno o únete con un código de invitación."
      />
    );
  }

  // Get member counts for all groups
  const groupIds = memberships.map((m) => m.groupId);
  const groupCounts = await prisma.groupMember.groupBy({
    by: ["groupId"],
    where: { groupId: { in: groupIds } },
    _count: { id: true },
  });
  const countMap = new Map(groupCounts.map((g) => [g.groupId, g._count.id]));

  const groups = memberships.map((m) => ({
    id: m.groupId,
    name: m.group.name,
    role: m.role,
    memberCount: countMap.get(m.groupId) ?? 1,
  }));

  return (
    <GroupsClient
      groups={groups}
      activeGroupId={activeGroupId ?? undefined}
      currentUserId={session.user.id!}
    />
  );
}
