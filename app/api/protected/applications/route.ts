import { ApplicationStatus } from "@/generated/prisma/enums";
import { createApplication, getApplications } from "@/lib/applications";
import {
  badRequestResponse,
  jsonResponse,
  unauthorizedResponse,
} from "@/lib/auth/api";
import { RESPONSE_CODES } from "@/lib/auth/enums";
import { getSession } from "@/lib/auth/session";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return Object.values(ApplicationStatus).some((status) => status === value);
}

function optionalDate(value: unknown, field: string) {
  if (value === undefined || value === null) return value;
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new Error(`${field} must be a valid date`);
  }
  return new Date(value);
}

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const applications = await getApplications(session.id);
  return jsonResponse({ applications });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return badRequestResponse("Invalid JSON body");
  }

  if (!isRecord(parsedBody)) return badRequestResponse("Invalid JSON body");

  const jobId =
    typeof parsedBody.jobId === "string" ? parsedBody.jobId.trim() : "";
  if (!jobId) return badRequestResponse("Job ID is required");

  const status = parsedBody.status ?? ApplicationStatus.DRAFT;
  if (!isApplicationStatus(status)) {
    return badRequestResponse("Invalid application status");
  }

  if (
    parsedBody.notes !== undefined &&
    parsedBody.notes !== null &&
    typeof parsedBody.notes !== "string"
  ) {
    return badRequestResponse("Notes must be a string");
  }

  let appliedAt: Date | null | undefined;
  let closedAt: Date | null | undefined;
  try {
    appliedAt = optionalDate(parsedBody.appliedAt, "Applied at");
    closedAt = optionalDate(parsedBody.closedAt, "Closed at");
  } catch (error) {
    return badRequestResponse(
      error instanceof Error ? error.message : "Invalid application dates",
    );
  }

  const application = await createApplication(session.id, {
    jobId,
    status,
    appliedAt,
    closedAt,
    notes: parsedBody.notes ?? null,
  });

  return jsonResponse({ application }, RESPONSE_CODES.CREATED);
}
