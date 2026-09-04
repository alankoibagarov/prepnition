import { ApplicationStatus, type Prisma } from "@/generated/prisma/client";
import type { CompaniesModel } from "@/generated/prisma/models/Companies";
import type { InterviewsModel } from "@/generated/prisma/models/Interviews";
import type { JobsModel } from "@/generated/prisma/models/Jobs";
import { prisma } from "@/lib/prisma";

export type CreateInterviewInput = {
  jobId: string;
  status?: ApplicationStatus;
  appliedAt?: Date | string | null;
  closedAt?: Date | string | null;
  notes?: string | null;
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

function toApplicationStatus(status?: ApplicationStatus): ApplicationStatus {
  return status ?? ApplicationStatus.DRAFT;
}

function mapHistory(history: ApplicationWithHistories["histories"][number]) {
  const { applicationId, ...rest } = history;
  return { ...rest, interviewId: applicationId };
}

function mapApplicationToInterview(
  application: ApplicationWithHistories,
  userId: string,
  job: JobsModel | null,
  company: CompaniesModel | null,
  interviews: InterviewsModel[] | null,
) {
  const { profileId: _profileId, histories, ...rest } = application;
  return {
    ...rest,
    userId,
    status: rest.status,
    history: histories.map(mapHistory),
    job: {
      id: job?.id ?? null,
      title: job?.title ?? null,
      description: job?.description ?? null,
      location: job?.location ?? null,
      salary: job?.salary ?? null,
    },
    company: {
      id: company?.id ?? null,
      name: company?.name ?? null,
      url: company?.url ?? null,
    },
    interviews: interviews?.map((interview) => ({
      id: interview.id,
      title: interview.title,
      scheduledAt: interview.scheduledAt ?? null,
      status: interview.status,
      notes: interview.notes ?? null,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
    })),
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
    status: rest.status,
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
        jobId: data.jobId,
        status: toApplicationStatus(data.status),
        appliedAt: data.appliedAt ? new Date(data.appliedAt) : null,
        closedAt: data.closedAt ? new Date(data.closedAt) : null,
        notes: data.notes ?? null,
      },
    });

    const changes = {
      jobId: { before: null, after: application.jobId },
      status: { before: null, after: application.status },
      appliedAt: { before: null, after: application.appliedAt },
      closedAt: { before: null, after: application.closedAt },
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
    orderBy: { createdAt: "desc" },
    take,
    skip,
    include: { histories: { orderBy: { createdAt: "asc" } } },
  });

  const jobs = await prisma.jobs.findMany({
    where: { id: { in: applications.map((app) => app.jobId) } },
  });
  const jobMap = new Map(jobs.map((job) => [job.id, job]));

  const companies = await prisma.companies.findMany({
    where: { id: { in: jobs.map((job) => job.companyId) } },
  });
  const companyMap = new Map(companies.map((company) => [company.id, company]));

  const interviews = await prisma.interviews.findMany({
    where: { applicationId: { in: applications.map((app) => app.id) } },
  });

  const results = applications.map((app) =>
    mapApplicationToInterview(
      app,
      userId,
      jobMap.get(app.jobId) || null,
      companyMap.get((jobMap.get(app.jobId) || null)?.companyId || "") || null,
      interviews.filter((interview) => interview.applicationId === app.id) ||
        null,
    ),
  );

  return results;
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
    typeof changes.jobId !== "undefined" &&
    changes.jobId !== existing.jobId
  ) {
    diff.jobId = { before: existing.jobId, after: changes.jobId ?? null };
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
    typeof changes.appliedAt !== "undefined" &&
    (existing.appliedAt?.getTime?.() ?? null) !==
      (changes.appliedAt ? new Date(changes.appliedAt).getTime() : null)
  ) {
    diff.appliedAt = {
      before: existing.appliedAt,
      after: changes.appliedAt ? new Date(changes.appliedAt) : null,
    };
  }
  if (
    typeof changes.closedAt !== "undefined" &&
    (existing.closedAt?.getTime?.() ?? null) !==
      (changes.closedAt ? new Date(changes.closedAt).getTime() : null)
  ) {
    diff.closedAt = {
      before: existing.closedAt,
      after: changes.closedAt ? new Date(changes.closedAt) : null,
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
        jobId: changes.jobId ?? existing.jobId,
        status: changes.status
          ? toApplicationStatus(changes.status)
          : existing.status,
        appliedAt: changes.appliedAt
          ? new Date(changes.appliedAt)
          : existing.appliedAt,
        closedAt: changes.closedAt
          ? new Date(changes.closedAt)
          : existing.closedAt,
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
