import {
  badRequestResponse,
  jsonResponse,
  unauthorizedResponse,
} from "@/lib/auth/api";
import { RESPONSE_CODES } from "@/lib/auth/enums";
import { getSession } from "@/lib/auth/session";
import { createJob, getJobs } from "@/lib/jobs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const search = new URL(request.url).searchParams.get("search") ?? undefined;
  return jsonResponse({ jobs: await getJobs(search) });
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
    const job = await createJob({
      title: body.title,
      description: body.description,
      location: body.location,
      salary: body.salary,
      companyId: body.companyId,
    });
    return jsonResponse({ job }, RESPONSE_CODES.CREATED);
  } catch (error) {
    return badRequestResponse(
      error instanceof Error ? error.message : "Invalid job data",
    );
  }
}
