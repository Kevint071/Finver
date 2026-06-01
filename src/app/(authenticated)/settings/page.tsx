import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/features/settings/settings-client";
import { getUserMemberships, getActiveGroupId } from "@/server/dal";
import { NoGroupState } from "@/features/groups/no-group-state";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const memberships = await getUserMemberships();
  const activeGroupId = await getActiveGroupId();

  if (memberships.length === 0) {
    return (
      <NoGroupState
        title="Sin grupo"
        description="Necesitas pertenecer a un grupo para acceder a la configuración completa. Crea un grupo o únete a uno existente."
      />
    );
  }

  const activeMembership = memberships.find((m) => m.groupId === activeGroupId) ?? memberships[0];

  const group = await prisma.group.findUnique({
    where: { id: activeMembership.groupId },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
    },
  });

  if (!group) redirect("/dashboard");

  // Get member counts for all groups
  const groupIds = memberships.map((m) => m.groupId);
  const groupCounts = await prisma.groupMember.groupBy({
    by: ["groupId"],
    where: { groupId: { in: groupIds } },
    _count: { id: true },
  });
  const countMap = new Map(groupCounts.map((g) => [g.groupId, g._count.id]));

  return (
    <SettingsClient
      group={group}
      members={group.members}
      currentUserId={session.user.id!}
      currentRole={activeMembership.role}
      allGroups={memberships.map((m) => ({
        id: m.groupId,
        name: m.group.name,
        role: m.role,
        memberCount: countMap.get(m.groupId) ?? 0,
      }))}
      activeGroupId={activeMembership.groupId}
    />
  );
}
