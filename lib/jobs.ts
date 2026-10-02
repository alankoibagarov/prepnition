import { prisma } from "@/lib/prisma";

export type CreateJobInput = {
  title: string;
  description: string;
  location: string;
  salary: string;
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
          OR: [{ title: { contains: query } }, { salary: { contains: query } }],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function createJob(input: CreateJobInput) {
  const title = required(input.title, "Title");
  const description = required(input.description, "Description");
  const location = required(input.location, "Location");
  const salary = required(input.salary, "Salary");

  return prisma.jobs.create({
    data: {
      title,
      description,
      location,
      salary,
    },
  });
}
