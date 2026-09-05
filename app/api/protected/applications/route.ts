import {
  type CreateApplicationInput,
  createApplication,
  getApplications,
} from "@/lib/applications";
import {
  badRequestResponse,
  jsonResponse,
  unauthorizedResponse,
} from "@/lib/auth/api";
import { RESPONSE_CODES } from "@/lib/auth/enums";
import { getSession } from "@/lib/auth/session";
import { InterviewStatus } from "@/types/interview";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const applications = await getApplications(session.id);
  return jsonResponse({ applications });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  let body: Partial<CreateApplicationInput> = {};
  try {
    const parsed = await request.json();
    body =
      parsed && typeof parsed === "object"
        ? (parsed as Partial<CreateApplicationInput>)
        : {};
  } catch {
    return badRequestResponse("Invalid JSON body");
  }

  const jobId = (body.jobId ?? "").trim();
  if (!jobId) return badRequestResponse("Job ID is required");

  const application = await createApplication(session.id, {
    jobId,
    status:
      (body.status as InterviewStatus | undefined) ?? InterviewStatus.DRAFT,
    appliedAt: body.appliedAt ?? null,
    closedAt: body.closedAt ?? null,
    notes: body.notes ?? null,
  });

  return jsonResponse({ application }, RESPONSE_CODES.CREATED);
}
