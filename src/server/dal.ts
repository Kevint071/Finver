import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { MemberRole } from "@/generated/prisma";

export async function getCurrentUserMembership() {
  const user = await requireAuth();

  const membership = await prisma.groupMember.findFirst({
    where: { userId: user.id },
    include: { group: true },
  });

  return membership;
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
