import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type CreateJobInput = {
  title: unknown;
  description: unknown;
  location: unknown;
  salary: unknown;
  companyId: unknown;
};

export type UpdateJobInput = Partial<CreateJobInput>;

function required(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

export async function getJobs(search?: string) {
  const query = search?.trim();
  return prisma.jobs.findMany({
    where: {
      company: { deletedAt: null },
      deletedAt: null,
      ...(query
        ? {
            OR: [
              { title: { contains: query } },
              { salary: { contains: query } },
              { description: { contains: query } },
              { location: { contains: query } },
              { salary: { contains: query } },
              { company: { name: { contains: query } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { company: true },
  });
}

export async function createJob(input: CreateJobInput) {
  const title = required(input.title, "Title");
  const description = required(input.description, "Description");
  const location = required(input.location, "Location");
  const salary = required(input.salary, "Salary");
  const companyId = required(input.companyId, "Company ID");
  const company = await prisma.companies.findUnique({
    where: { id: companyId },
    select: { id: true, deletedAt: true },
  });
  if (!company || company.deletedAt) {
    throw new Error("Selected company was not found");
  }

  return prisma.jobs.create({
    data: {
      title,
      description,
      location,
      salary,
      company: { connect: { id: companyId } },
    },
    include: { company: true },
  });
}

export async function updateJob(id: string, input: UpdateJobInput) {
  const existing = await prisma.jobs.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });
  if (!existing) return null;

  const data: Prisma.JobsUpdateInput = {};
  for (const field of ["title", "description", "location", "salary"] as const) {
    if (input[field] !== undefined) {
      data[field] = required(input[field], field);
    }
  }

  if (input.companyId !== undefined) {
    const companyId = required(input.companyId, "Company ID");
    const company = await prisma.companies.findUnique({
      where: { id: companyId },
      select: { id: true },
    });
    if (!company) throw new Error("Selected company was not found");
    data.company = { connect: { id: companyId } };
  }

  return prisma.jobs.update({
    where: { id },
    data,
    include: { company: true },
  });
}

export async function softDeleteJob(id: string) {
  const result = await prisma.jobs.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  return result.count > 0;
}
