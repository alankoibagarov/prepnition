import { prisma } from "@/lib/prisma";

function required(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

export async function getCompanies(search?: string) {
  const query = search?.trim();
  return prisma.companies.findMany({
    where: query
      ? {
          OR: [{ name: { contains: query } }, { url: { contains: query } }],
        }
      : undefined,
    orderBy: { name: "asc" },
    take: 100,
  });
}

export async function createCompany(input: { name: unknown; url: unknown }) {
  const name = required(input.name, "Company name");
  const url = required(input.url, "Company URL");
  return prisma.companies.create({ data: { name, url } });
}
