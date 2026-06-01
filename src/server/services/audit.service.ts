import { prisma } from "@/lib/prisma";
import { EventType } from "@/generated/prisma";

export async function createAuditLog(
  groupId: string,
  performedBy: string,
  eventType: EventType,
  description: string
) {
  return prisma.auditLog.create({
    data: { groupId, performedBy, eventType, description },
  });
}

export async function getAuditLogs(
  groupId: string,
  options?: { take?: number; skip?: number }
) {
  return prisma.auditLog.findMany({
    where: { groupId },
    include: {
      performer: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: options?.take ?? 50,
    skip: options?.skip,
  });
}
