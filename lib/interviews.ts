import { prisma } from "@/lib/prisma";
import type { InterviewStatus } from "@/types/interview";

export type CreateInterviewInput = {
  title: string;
  company?: string;
  position?: string;
  scheduledAt?: Date | string | null;
  status: InterviewStatus;
  notes?: string;
};

export type UpdateInterviewInput = Partial<CreateInterviewInput>;

export async function createInterview(
  userId: string,
  data: CreateInterviewInput,
) {
  return prisma.interview.create({
    data: {
      userId,
      title: data.title,
      company: data.company ?? null,
      position: data.position ?? null,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      status: data.status,
      notes: data.notes ?? null,
    },
  });
}

export async function getInterviewsForUser(
  userId: string,
  opts?: { take?: number; skip?: number },
) {
  const { take = 50, skip = 0 } = opts || {};
  return prisma.interview.findMany({
    where: { userId, deletedAt: null },
    orderBy: { scheduledAt: "desc" },
    take,
    skip,
  });
}

export async function getInterviewById(id: string, userId: string) {
  return prisma.interview.findFirst({
    where: { id, userId, deletedAt: null },
  });
}

export async function updateInterview(
  id: string,
  userId: string,
  changes: UpdateInterviewInput,
) {
  // Only allow updates where interview belongs to user
  const existing = await prisma.interview.findFirst({
    where: { id, userId, deletedAt: null },
  });
  if (!existing) return null;

  return prisma.interview.update({
    where: { id },
    data: {
      title: changes.title ?? existing.title,
      company: changes.company ?? existing.company,
      position: changes.position ?? existing.position,
      scheduledAt: changes.scheduledAt
        ? new Date(changes.scheduledAt as any)
        : existing.scheduledAt,
      status: (changes.status as any) ?? existing.status,
      notes: changes.notes ?? existing.notes,
    },
  });
}

export async function softDeleteInterview(id: string, userId: string) {
  const existing = await prisma.interview.findFirst({
    where: { id, userId, deletedAt: null },
  });
  if (!existing) return null;
  return prisma.interview.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
