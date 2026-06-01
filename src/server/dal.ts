import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { MemberRole } from "@/generated/prisma";
import { cookies } from "next/headers";

const ACTIVE_GROUP_COOKIE = "finver-active-group";

export async function getActiveGroupId(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(ACTIVE_GROUP_COOKIE);
  if (cookie?.value) return cookie.value;

  const user = await requireAuth();
  const firstMembership = await prisma.groupMember.findFirst({
    where: { userId: user.id },
    orderBy: { joinedAt: "asc" },
    select: { groupId: true },
  });

  return firstMembership?.groupId ?? null;
}

export async function getCurrentUserMembership() {
  const [user, activeGroupId] = await Promise.all([
    requireAuth(),
    getActiveGroupId(),
  ]);

  if (activeGroupId) {
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: activeGroupId, userId: user.id! } },
      include: { group: true },
    });
    if (membership) return membership;
  }

  // Fallback: return first membership if cookie was stale
  const membership = await prisma.groupMember.findFirst({
    where: { userId: user.id },
    orderBy: { joinedAt: "asc" },
    include: { group: true },
  });

  return membership;
}

export async function getUserMemberships() {
  const user = await requireAuth();

  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.id },
    orderBy: { joinedAt: "asc" },
    include: { group: true },
  });

  return memberships;
}

export async function requireGroupMembership() {
  const membership = await getCurrentUserMembership();
  if (!membership) {
    throw new Error("No group membership found");
  }
  return membership;
}

export async function requireRole(allowedRoles: MemberRole[]) {
  const membership = await requireGroupMembership();
  if (!allowedRoles.includes(membership.role)) {
    throw new Error("Insufficient permissions");
  }
  return membership;
}
