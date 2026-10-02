import {
  badRequestResponse,
  jsonResponse,
  unauthorizedResponse,
} from "@/lib/auth/api";
import { RESPONSE_CODES } from "@/lib/auth/enums";
import { getSession } from "@/lib/auth/session";
import { createCompany, getCompanies } from "@/lib/companies";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const search = new URL(request.url).searchParams.get("search") ?? undefined;
  return jsonResponse({ companies: await getCompanies(search) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("Invalid JSON body");
  }
  if (!isRecord(body)) return badRequestResponse("Invalid JSON body");

  try {
    const company = await createCompany({
      name: body.name,
      url: body.url,
    });
    return jsonResponse({ company }, RESPONSE_CODES.CREATED);
  } catch (error) {
    return badRequestResponse(
      error instanceof Error ? error.message : "Invalid company data",
    );
  }
}
