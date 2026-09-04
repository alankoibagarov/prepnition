import {
  badRequestResponse,
  jsonResponse,
  unauthorizedResponse,
} from "@/lib/auth/api";
import { RESPONSE_CODES } from "@/lib/auth/enums";
import { getSession } from "@/lib/auth/session";
import { type CreateJobInput, createJob, getJobs } from "@/lib/jobs";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const search = new URL(request.url).searchParams.get("search") ?? undefined;
  return jsonResponse({ jobs: await getJobs(search) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  try {
    const job = await createJob((await request.json()) as CreateJobInput);
    return jsonResponse({ job }, RESPONSE_CODES.CREATED);
  } catch (error) {
    return badRequestResponse(
      error instanceof Error ? error.message : "Invalid job data",
    );
  }
}
