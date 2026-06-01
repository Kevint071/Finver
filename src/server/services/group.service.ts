import { prisma } from "@/lib/prisma";
import { MemberRole, EventType } from "@/generated/prisma";
import { nanoid } from "@/lib/nanoid";

export async function createGroup(name: string, userId: string) {
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

export async function leaveGroup(groupId: string, userId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });

  if (!membership) {
    throw new Error("No eres miembro de este grupo");
  }

  if (membership.role === MemberRole.OWNER) {
    throw new Error("El owner no puede abandonar el grupo. Transfiere la propiedad o elimínalo.");
  }

  await prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId } },
  });

  return { success: true };
}

export async function deleteGroup(groupId: string, userId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new Error("Grupo no encontrado");
  }

  if (group.ownerId !== userId) {
    throw new Error("Solo el owner puede eliminar el grupo");
  }

  await prisma.group.delete({
    where: { id: groupId },
  });

  return { success: true };
}

export async function renameGroup(groupId: string, newName: string, userId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });

  if (!membership || membership.role === MemberRole.MEMBER) {
    throw new Error("No tienes permisos para renombrar este grupo");
  }

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) throw new Error("Grupo no encontrado");

  const oldName = group.name;
  const updated = await updateGroupName(groupId, newName);

  await prisma.auditLog.create({
    data: {
      groupId,
      performedBy: userId,
      eventType: EventType.GROUP_RENAMED,
      description: `Grupo renombrado de "${oldName}" a "${newName}"`,
    },
  });

  return updated;
}

export async function getGroupDetails(groupId: string, userId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });

  if (!membership) {
    throw new Error("No eres miembro de este grupo");
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
      },
    },
  });

  if (!group) throw new Error("Grupo no encontrado");

  return {
    id: group.id,
    name: group.name,
    inviteCode: group.inviteCode,
    members: group.members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
      role: m.role,
    })),
    currentUserRole: membership.role,
  };
}
