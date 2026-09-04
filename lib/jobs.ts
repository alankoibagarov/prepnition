import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const jobInclude = { company: true } satisfies Prisma.JobsInclude;

export type JobWithCompany = Prisma.JobsGetPayload<{
  include: typeof jobInclude;
}>;

export type CreateJobInput = {
  title: string;
  description: string;
  location: string;
  salary: string;
  companyName: string;
  companyUrl: string;
};

function required(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

export async function getJobs(search?: string) {
  const query = search?.trim();
  return prisma.jobs.findMany({
    where: query
      ? {
          OR: [
            { title: { contains: query } },
            { salary: { contains: query } },
            { company: { name: { contains: query } } },
          ],
        }
      : undefined,
    include: jobInclude,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function createJob(input: CreateJobInput) {
  const title = required(input.title, "Title");
  const description = required(input.description, "Description");
  const location = required(input.location, "Location");
  const salary = required(input.salary, "Salary");
  const companyName = required(input.companyName, "Company name");
  const companyUrl = required(input.companyUrl, "Company URL");

  return prisma.jobs.create({
    data: {
      title,
      description,
      location,
      salary,
      company: { create: { name: companyName, url: companyUrl } },
    },
    include: jobInclude,
  });
}
