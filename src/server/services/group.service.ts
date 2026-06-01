import { prisma } from "@/lib/prisma";
import { MemberRole } from "@/generated/prisma";
import { nanoid } from "@/lib/nanoid";

export async function createGroup(name: string, userId: string) {
  const existingMembership = await prisma.groupMember.findFirst({
    where: { userId },
  });

  if (existingMembership) {
    throw new Error("User already belongs to a group");
  }

  const inviteCode = nanoid(8);

  const group = await prisma.group.create({
    data: {
      name,
      inviteCode,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: MemberRole.OWNER,
        },
      },
    },
    include: { members: true },
  });

  return group;
}

export async function joinGroup(inviteCode: string, userId: string) {
  const existingMembership = await prisma.groupMember.findFirst({
    where: { userId },
  });

  if (existingMembership) {
    throw new Error("User already belongs to a group");
  }

  const group = await prisma.group.findUnique({
    where: { inviteCode },
    include: { _count: { select: { members: true } } },
  });

  if (!group) {
    throw new Error("Código de invitación inválido");
  }

  if (group._count.members >= 20) {
    throw new Error("El grupo alcanzó el límite de miembros");
  }

  const member = await prisma.groupMember.create({
    data: {
      groupId: group.id,
      userId,
      role: MemberRole.MEMBER,
    },
  });

  return { group, member };
}

export async function regenerateInviteCode(groupId: string) {
  const newCode = nanoid(8);
  return prisma.group.update({
    where: { id: groupId },
    data: { inviteCode: newCode },
  });
}

export async function updateGroupName(groupId: string, name: string) {
  return prisma.group.update({
    where: { id: groupId },
    data: { name },
  });
}

export async function getGroupWithMembers(groupId: string) {
  return prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
      },
    },
  });
}

export async function promoteToAdmin(groupId: string, userId: string) {
  return prisma.groupMember.update({
    where: { groupId_userId: { groupId, userId } },
    data: { role: MemberRole.ADMIN },
  });
}

export async function revokeAdmin(groupId: string, userId: string) {
  return prisma.groupMember.update({
    where: { groupId_userId: { groupId, userId } },
    data: { role: MemberRole.MEMBER },
  });
}

export async function transferOwnership(
  groupId: string,
  currentOwnerId: string,
  newOwnerId: string
) {
  return prisma.$transaction([
    prisma.group.update({
      where: { id: groupId },
      data: { ownerId: newOwnerId },
    }),
    prisma.groupMember.update({
      where: { groupId_userId: { groupId, userId: newOwnerId } },
      data: { role: MemberRole.OWNER },
    }),
    prisma.groupMember.update({
      where: { groupId_userId: { groupId, userId: currentOwnerId } },
      data: { role: MemberRole.ADMIN },
    }),
  ]);
}
