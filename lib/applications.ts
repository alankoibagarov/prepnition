import {
  ApplicationStatus,
  InterviewStatus,
  type InterviewType,
  type Prisma,
} from "@/generated/prisma/client";
import type { CompaniesModel } from "@/generated/prisma/models/Companies";
import type { InterviewsModel } from "@/generated/prisma/models/Interviews";
import type { JobsModel } from "@/generated/prisma/models/Jobs";
import { prisma } from "@/lib/prisma";

export type ApplicationDetailUpdate = {
  jobId?: string;
  newJob?: {
    title: string;
    description: string;
    location: string;
    salary: string;
    companyName: string;
    companyUrl: string;
  };
  status?: ApplicationStatus;
  appliedAt?: string | null;
  closedAt?: string | null;
  notes?: string | null;
  job?: {
    title?: string;
    description?: string;
    location?: string;
    salary?: string;
  };
  company?: { name?: string; url?: string };
};

export type InterviewInput = {
  type: InterviewType;
  title: string;
  scheduledAt?: string | null;
  durationMinutes?: number | null;
  status?: InterviewStatus;
  notes?: string | null;
};

export type InterviewUpdate = Partial<InterviewInput>;

const detailInclude = {
  job: { include: { company: true } },
  interviews: { orderBy: { scheduledAt: "asc" as const } },
  histories: { orderBy: { createdAt: "desc" as const } },
} satisfies Prisma.ApplicationsInclude;

type ApplicationWithDetails = Prisma.ApplicationsGetPayload<{
  include: typeof detailInclude;
}>;

async function profileIdForUser(userId: string) {
  const profile = await prisma.candidateProfiles.findUnique({
    where: { userId },
  });
  return profile?.id ?? null;
}

async function ownedApplication(id: string, userId: string) {
  const profileId = await profileIdForUser(userId);
  if (!profileId) return null;
  return prisma.applications.findFirst({
    where: { id, profileId, deletedAt: null },
    include: detailInclude,
  });
}

function dateValue(value: string | null | undefined) {
  return value === undefined || value === null ? null : new Date(value);
}

function nonEmpty(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${field} is required`);
  return value.trim();
}

function serializeApplication(application: ApplicationWithDetails) {
  const { jobId: _jobId, ...applicationWithoutJobId } = application;
  const { companyId: _companyId, ...jobWithoutCompanyId } =
    applicationWithoutJobId.job;
  const { company, ...job } = jobWithoutCompanyId;

  return {
    ...applicationWithoutJobId,
    job,
    company,
  };
}

type ApplicationWithHistories = Prisma.ApplicationsGetPayload<{
  include: { histories: true };
}>;

async function getProfileIdForUser(userId: string): Promise<string | null> {
  const profile = await prisma.candidateProfiles.findUnique({
    where: { userId },
  });
  return profile?.id ?? null;
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

export async function getApplications(
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

export async function getApplicationDetail(id: string, userId: string) {
  const application = await ownedApplication(id, userId);
  return application ? serializeApplication(application) : null;
}

export async function updateApplicationDetail(
  id: string,
  userId: string,
  changes: ApplicationDetailUpdate,
) {
  const existing = await ownedApplication(id, userId);
  if (!existing) return null;
  const diff: Record<string, { before: unknown; after: unknown }> = {};
  const applicationData: Prisma.ApplicationsUpdateInput = {};
  const jobData: Prisma.JobsUpdateInput = {};
  const companyData: Prisma.CompaniesUpdateInput = {};

  if (changes.jobId !== undefined && changes.jobId !== existing.jobId) {
    const selectedJob = await prisma.jobs.findUnique({
      where: { id: changes.jobId },
    });
    if (!selectedJob) throw new Error("Selected job was not found");
    applicationData.job = { connect: { id: changes.jobId } };
    diff.jobId = { before: existing.jobId, after: changes.jobId };
  }

  if (changes.status !== undefined && changes.status !== existing.status) {
    applicationData.status = changes.status;
    diff.status = { before: existing.status, after: changes.status };
  }
  for (const field of ["appliedAt", "closedAt", "notes"] as const) {
    if (changes[field] !== undefined) {
      const before = existing[field];
      const after =
        field === "notes" ? changes[field] : dateValue(changes[field]);
      const beforeValue = before instanceof Date ? before.getTime() : before;
      const afterValue = after instanceof Date ? after.getTime() : after;
      if (beforeValue !== afterValue) {
        applicationData[field] = after as never;
        diff[field] = { before, after };
      }
    }
  }
  for (const field of ["title", "description", "location", "salary"] as const) {
    if (changes.newJob) continue;
    const value = changes.job?.[field];
    if (value !== undefined && value !== existing.job[field]) {
      const nextValue = nonEmpty(value, `job.${field}`);
      jobData[field] = nextValue;
      diff[`job.${field}`] = { before: existing.job[field], after: nextValue };
    }
  }
  for (const field of ["name", "url"] as const) {
    if (changes.newJob) continue;
    const value = changes.company?.[field];
    if (value !== undefined && value !== existing.job.company[field]) {
      const nextValue = nonEmpty(value, `company.${field}`);
      companyData[field] = nextValue;
      diff[`company.${field}`] = {
        before: existing.job.company[field],
        after: nextValue,
      };
    }
  }
  if (changes.newJob) {
    diff.newJob = { before: null, after: "created" };
  }
  if (!Object.keys(diff).length) return serializeApplication(existing);

  return prisma.$transaction(async (tx) => {
    if (changes.newJob) {
      const newJob = await tx.jobs.create({
        data: {
          title: nonEmpty(changes.newJob.title, "job.title"),
          description: nonEmpty(changes.newJob.description, "job.description"),
          location: nonEmpty(changes.newJob.location, "job.location"),
          salary: nonEmpty(changes.newJob.salary, "job.salary"),
          company: {
            create: {
              name: nonEmpty(changes.newJob.companyName, "company.name"),
              url: nonEmpty(changes.newJob.companyUrl, "company.url"),
            },
          },
        },
        include: { company: true },
      });
      applicationData.job = { connect: { id: newJob.id } };
      diff.jobId = { before: existing.jobId, after: newJob.id };
      diff.job = { before: existing.job, after: newJob };
    }
    if (Object.keys(companyData).length)
      await tx.companies.update({
        where: { id: existing.job.companyId },
        data: companyData,
      });
    if (Object.keys(jobData).length)
      await tx.jobs.update({ where: { id: existing.jobId }, data: jobData });
    const application = await tx.applications.update({
      where: { id },
      data: applicationData,
      include: detailInclude,
    });
    await tx.applicationHistory.create({
      data: {
        applicationId: id,
        userId,
        action: "UPDATE",
        changes: diff as Prisma.InputJsonValue,
      },
    });
    return serializeApplication(application);
  });
}

export type CreateApplicationInput = {
  jobId: string;
  status?: ApplicationStatus;
  appliedAt?: Date | string | null;
  closedAt?: Date | string | null;
  notes?: string | null;
};

export type UpdateApplicationInput = Partial<CreateApplicationInput>;

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

async function getOrCreateProfileId(userId: string): Promise<string> {
  const profile = await prisma.candidateProfiles.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  return profile.id;
}

function toApplicationStatus(status?: ApplicationStatus): ApplicationStatus {
  return status ?? ApplicationStatus.DRAFT;
}

export async function createApplication(
  userId: string,
  data: CreateApplicationInput,
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

export async function getApplicationById(id: string, userId: string) {
  const profileId = await getProfileIdForUser(userId);
  if (!profileId) return null;

  const application = await prisma.applications.findFirst({
    where: { id, profileId, deletedAt: null },
  });
  if (!application) return null;

  return mapApplicationRecord(application, userId);
}

export async function updateApplication(
  id: string,
  userId: string,
  changes: UpdateApplicationInput,
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

export async function softDeleteApplication(id: string, userId: string) {
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

export async function createApplicationInterview(
  id: string,
  userId: string,
  input: InterviewInput,
) {
  const existing = await ownedApplication(id, userId);
  if (!existing) return null;
  const title = nonEmpty(input.title, "title");
  return prisma.$transaction(async (tx) => {
    const created = await tx.interviews.create({
      data: {
        applicationId: id,
        type: input.type,
        title,
        status: input.status ?? InterviewStatus.SCHEDULED,
        scheduledAt: dateValue(input.scheduledAt),
        durationMinutes: input.durationMinutes ?? null,
        notes: input.notes ?? null,
      },
    });
    await tx.applicationHistory.create({
      data: {
        applicationId: id,
        userId,
        action: "INTERVIEW_CREATE",
        changes: { interviewId: created.id, title: created.title },
      },
    });
    return created;
  });
}

export async function updateApplicationInterview(
  id: string,
  interviewId: string,
  userId: string,
  input: InterviewUpdate,
) {
  const existing = await ownedApplication(id, userId);
  if (!existing) return null;
  const interview = existing.interviews.find((item) => item.id === interviewId);
  if (!interview) return null;
  const data: Prisma.InterviewsUpdateInput = {};
  const changes: Record<string, { before: unknown; after: unknown }> = {};
  for (const field of [
    "type",
    "title",
    "status",
    "durationMinutes",
    "notes",
  ] as const) {
    if (input[field] !== undefined && input[field] !== interview[field]) {
      data[field] =
        field === "title"
          ? nonEmpty(input[field], field)
          : (input[field] as never);
      changes[`interview.${field}`] = {
        before: interview[field],
        after: input[field],
      };
    }
  }
  if (input.scheduledAt !== undefined) {
    const after = dateValue(input.scheduledAt);
    if (
      (interview.scheduledAt?.getTime() ?? null) !== (after?.getTime() ?? null)
    ) {
      data.scheduledAt = after;
      changes["interview.scheduledAt"] = {
        before: interview.scheduledAt,
        after,
      };
    }
  }
  if (!Object.keys(changes).length) return interview;
  return prisma.$transaction(async (tx) => {
    const updated = await tx.interviews.update({
      where: { id: interviewId },
      data,
    });
    await tx.applicationHistory.create({
      data: {
        applicationId: id,
        userId,
        action: "INTERVIEW_UPDATE",
        changes: changes as Prisma.InputJsonValue,
      },
    });
    return updated;
  });
}

export async function deleteApplicationInterview(
  id: string,
  interviewId: string,
  userId: string,
) {
  const existing = await ownedApplication(id, userId);
  const interview = existing?.interviews.find(
    (item) => item.id === interviewId,
  );
  if (!existing || !interview) return null;
  await prisma.$transaction([
    prisma.interviews.delete({ where: { id: interviewId } }),
    prisma.applicationHistory.create({
      data: {
        applicationId: id,
        userId,
        action: "INTERVIEW_DELETE",
        changes: { interviewId, title: interview.title },
      },
    }),
  ]);
  return { success: true };
}

export async function getApplicationHistory(
  interviewId: string,
  userId: string,
) {
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
