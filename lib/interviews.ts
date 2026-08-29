import type { ApplicationStatus, Prisma } from "@/generated/prisma/client";
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

type ApplicationWithHistories = Prisma.ApplicationsGetPayload<{
  include: { histories: true };
}>;

async function getOrCreateProfileId(userId: string): Promise<string> {
  const profile = await prisma.candidateProfiles.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  return profile.id;
}

async function getProfileIdForUser(userId: string): Promise<string | null> {
  const profile = await prisma.candidateProfiles.findUnique({
    where: { userId },
  });
  return profile?.id ?? null;
}

function toApplicationStatus(status: InterviewStatus): ApplicationStatus {
  return status as ApplicationStatus;
}

function mapHistory(history: ApplicationWithHistories["histories"][number]) {
  const { applicationId, ...rest } = history;
  return { ...rest, interviewId: applicationId };
}

function mapApplicationToInterview(
  application: ApplicationWithHistories,
  userId: string,
) {
  const { profileId: _profileId, histories, ...rest } = application;
  return {
    ...rest,
    userId,
    status: rest.status as InterviewStatus,
    history: histories.map(mapHistory),
  };
}

function mapApplicationRecord(
  application: Omit<ApplicationWithHistories, "histories">,
  userId: string,
) {
  const { profileId: _profileId, ...rest } = application;
  return {
    ...rest,
    userId,
    status: rest.status as InterviewStatus,
  };
}

export async function createInterview(
  userId: string,
  data: CreateInterviewInput,
) {
  const profileId = await getOrCreateProfileId(userId);

  const created = await prisma.$transaction(async (tx) => {
    const application = await tx.applications.create({
      data: {
        profileId,
        title: data.title,
        company: data.company ?? null,
        position: data.position ?? null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        status: toApplicationStatus(data.status),
        notes: data.notes ?? null,
      },
    });

    const changes = {
      title: { before: null, after: application.title },
      company: { before: null, after: application.company },
      position: { before: null, after: application.position },
      scheduledAt: { before: null, after: application.scheduledAt },
      status: { before: null, after: application.status },
      notes: { before: null, after: application.notes },
    } satisfies Prisma.InputJsonObject;

    await tx.applicationHistory.create({
      data: {
        applicationId: application.id,
        userId,
        action: "CREATE",
        changes,
      },
    });

    return application;
  });

  return mapApplicationRecord(created, userId);
}

export async function getInterviewsForUser(
  userId: string,
  opts?: { take?: number; skip?: number },
) {
  const profileId = await getProfileIdForUser(userId);
  if (!profileId) return [];

  const { take = 50, skip = 0 } = opts || {};
  const applications = await prisma.applications.findMany({
    where: { profileId, deletedAt: null },
    orderBy: { scheduledAt: "desc" },
    take,
    skip,
    include: { histories: { orderBy: { createdAt: "asc" } } },
  });

  return applications.map((app) => mapApplicationToInterview(app, userId));
}

export async function getInterviewById(id: string, userId: string) {
  const profileId = await getProfileIdForUser(userId);
  if (!profileId) return null;

  const application = await prisma.applications.findFirst({
    where: { id, profileId, deletedAt: null },
  });
  if (!application) return null;

  return mapApplicationRecord(application, userId);
}

export async function updateInterview(
  id: string,
  userId: string,
  changes: UpdateInterviewInput,
) {
  const profileId = await getProfileIdForUser(userId);
  if (!profileId) return null;

  const existing = await prisma.applications.findFirst({
    where: { id, profileId, deletedAt: null },
  });
  if (!existing) return null;

  const diff: Record<string, { before: unknown; after: unknown }> = {};
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
      ? new Date(changes.scheduledAt)
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
    toApplicationStatus(changes.status) !== existing.status
  ) {
    diff.status = {
      before: existing.status,
      after: toApplicationStatus(changes.status),
    };
  }
  if (
    typeof changes.notes !== "undefined" &&
    changes.notes !== existing.notes
  ) {
    diff.notes = { before: existing.notes, after: changes.notes ?? null };
  }

  if (Object.keys(diff).length === 0) {
    return mapApplicationRecord(existing, userId);
  }

  const [updated] = await prisma.$transaction([
    prisma.applications.update({
      where: { id },
      data: {
        title: changes.title ?? existing.title,
        company: changes.company ?? existing.company,
        position: changes.position ?? existing.position,
        scheduledAt: changes.scheduledAt
          ? new Date(changes.scheduledAt)
          : existing.scheduledAt,
        status: changes.status
          ? toApplicationStatus(changes.status)
          : existing.status,
        notes: changes.notes ?? existing.notes,
      },
    }),
    prisma.applicationHistory.create({
      data: {
        applicationId: id,
        userId,
        action: "UPDATE",
        changes: diff as Prisma.InputJsonValue,
      },
    }),
  ]);

  return mapApplicationRecord(updated, userId);
}

export async function softDeleteInterview(id: string, userId: string) {
  const profileId = await getProfileIdForUser(userId);
  if (!profileId) return null;

  const existing = await prisma.applications.findFirst({
    where: { id, profileId, deletedAt: null },
  });
  if (!existing) return null;

  const deletedAt = new Date();

  const [updated] = await prisma.$transaction([
    prisma.applications.update({ where: { id }, data: { deletedAt } }),
    prisma.applicationHistory.create({
      data: {
        applicationId: id,
        userId,
        action: "DELETE",
        changes: { deletedAt: { before: null, after: deletedAt } },
      },
    }),
  ]);

  return mapApplicationRecord(updated, userId);
}

export async function getInterviewHistory(interviewId: string, userId: string) {
  const profileId = await getProfileIdForUser(userId);
  if (!profileId) return [];

  const existing = await prisma.applications.findFirst({
    where: { id: interviewId, profileId },
  });
  if (!existing) return [];

  const histories = await prisma.applicationHistory.findMany({
    where: { applicationId: interviewId },
    orderBy: { createdAt: "desc" },
  });

  return histories.map(mapHistory);
}
