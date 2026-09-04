import {
  type ApplicationStatus,
  InterviewStatus,
  type InterviewType,
  type Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type ApplicationDetailUpdate = {
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
    const value = changes.job?.[field];
    if (value !== undefined && value !== existing.job[field]) {
      const nextValue = nonEmpty(value, `job.${field}`);
      jobData[field] = nextValue;
      diff[`job.${field}`] = { before: existing.job[field], after: nextValue };
    }
  }
  for (const field of ["name", "url"] as const) {
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
  if (!Object.keys(diff).length) return serializeApplication(existing);

  return prisma.$transaction(async (tx) => {
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

export async function deleteApplication(id: string, userId: string) {
  const existing = await ownedApplication(id, userId);
  if (!existing) return null;
  await prisma.$transaction([
    prisma.applications.update({
      where: { id },
      data: { deletedAt: new Date() },
    }),
  ]);
  return { success: true };
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
