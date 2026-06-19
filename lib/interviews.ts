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
  // Create interview and a CREATE history entry in a transaction
  const created = await prisma.$transaction(async (tx) => {
    const interview = await tx.interview.create({
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

    const changes: Record<string, { before: any; after: any }> = {
      title: { before: null, after: interview.title },
      company: { before: null, after: interview.company },
      position: { before: null, after: interview.position },
      scheduledAt: { before: null, after: interview.scheduledAt },
      status: { before: null, after: interview.status },
      notes: { before: null, after: interview.notes },
    };

    await tx.interviewHistory.create({
      data: {
        interviewId: interview.id,
        userId,
        action: "CREATE",
        changes,
      },
    });

    return interview;
  });

  return created;
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
    include: { histories: { orderBy: { createdAt: "asc" } } },
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

  // Compute diff of only changed fields
  const diff: Record<string, { before: any; after: any }> = {};
  if (
    typeof changes.title !== "undefined" &&
    changes.title !== existing.title
  ) {
    diff.title = { before: existing.title, after: changes.title ?? null };
  }
  if (
    typeof changes.company !== "undefined" &&
    changes.company !== existing.company
  ) {
    diff.company = { before: existing.company, after: changes.company ?? null };
  }
  if (
    typeof changes.position !== "undefined" &&
    changes.position !== existing.position
  ) {
    diff.position = {
      before: existing.position,
      after: changes.position ?? null,
    };
  }
  if (typeof changes.scheduledAt !== "undefined") {
    const newDate = changes.scheduledAt
      ? new Date(changes.scheduledAt as any)
      : null;
    const oldDate = existing.scheduledAt ?? null;
    if (
      (oldDate &&
        newDate &&
        oldDate.getTime &&
        newDate.getTime &&
        new Date(oldDate).getTime() !== new Date(newDate).getTime()) ||
      (oldDate === null && newDate !== null) ||
      (oldDate !== null && newDate === null)
    ) {
      diff.scheduledAt = { before: existing.scheduledAt, after: newDate };
    }
  }
  if (
    typeof changes.status !== "undefined" &&
    (changes.status as any) !== existing.status
  ) {
    diff.status = { before: existing.status, after: changes.status as any };
  }
  if (
    typeof changes.notes !== "undefined" &&
    changes.notes !== existing.notes
  ) {
    diff.notes = { before: existing.notes, after: changes.notes ?? null };
  }

  // If no actual changes, return existing
  if (Object.keys(diff).length === 0) return existing;

  // Apply update and write history in a transaction
  const [updated] = await prisma.$transaction([
    prisma.interview.update({
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
    }),
    prisma.interviewHistory.create({
      data: {
        interviewId: id,
        userId,
        action: "UPDATE",
        changes: diff,
      },
    }),
  ]);

  return updated as any;
}

export async function softDeleteInterview(id: string, userId: string) {
  const existing = await prisma.interview.findFirst({
    where: { id, userId, deletedAt: null },
  });
  if (!existing) return null;

  const deletedAt = new Date();

  const [updated] = await prisma.$transaction([
    prisma.interview.update({ where: { id }, data: { deletedAt } }),
    prisma.interviewHistory.create({
      data: {
        interviewId: id,
        userId,
        action: "DELETE",
        changes: { deletedAt: { before: null, after: deletedAt } },
      },
    }),
  ]);

  return updated as any;
}

export async function getInterviewHistory(interviewId: string, userId: string) {
  // Ensure the interview belongs to the user
  const existing = await prisma.interview.findFirst({
    where: { id: interviewId, userId },
  });
  if (!existing) return [];
  return prisma.interviewHistory.findMany({
    where: { interviewId },
    orderBy: { createdAt: "desc" },
  });
}
