import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/features/settings/settings-client";
import { getUserMemberships, getActiveGroupId } from "@/server/dal";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const memberships = await getUserMemberships();
  const activeGroupId = await getActiveGroupId();

  if (memberships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-xl font-bold">Sin grupo</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Necesitas pertenecer a un grupo para acceder a la configuración.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
        >
          Ir a inicio
        </Link>
      </div>
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

  return (
    <SettingsClient
      group={group}
      members={group.members}
      currentUserId={session.user.id!}
      currentRole={activeMembership.role}
    />
  );
}
