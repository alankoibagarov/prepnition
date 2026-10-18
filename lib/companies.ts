import { prisma } from "@/lib/prisma";

export type CompanyInput = {
  name: unknown;
  url: unknown;
};

function required(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

function companyUrl(value: unknown) {
  const url = required(value, "Company URL");
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error();
    }
  } catch {
    throw new Error("Company URL must be a valid HTTP or HTTPS URL");
  }
  return url;
}

export async function getCompanies(search?: string) {
  const query = search?.trim();
  return prisma.companies.findMany({
    where: {
      deletedAt: null,
      ...(query
        ? {
            OR: [{ name: { contains: query } }, { url: { contains: query } }],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    take: 100,
    include: { _count: { select: { jobs: true } } },
  });
}

export async function createCompany(input: CompanyInput) {
  const name = required(input.name, "Company name");
  const url = companyUrl(input.url);
  return prisma.companies.create({ data: { name, url } });
}

export async function updateCompany(id: string, input: CompanyInput) {
  const name = required(input.name, "Company name");
  const url = companyUrl(input.url);
  const company = await prisma.companies.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });
  if (!company) throw new Error("Company was not found");

  return prisma.companies.update({
    where: { id },
    data: { name, url },
  });
}

export async function softDeleteCompany(id: string) {
  const result = await prisma.companies.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  if (result.count === 0) throw new Error("Company was not found");
}
