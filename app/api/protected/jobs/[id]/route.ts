import {
  badRequestResponse,
  jsonResponse,
  unauthorizedResponse,
} from "@/lib/auth/api";
import { RESPONSE_CODES } from "@/lib/auth/enums";
import { getSession } from "@/lib/auth/session";
import { softDeleteJob, updateJob } from "@/lib/jobs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
    const job = await updateJob((await params).id, {
      title: body.title,
      description: body.description,
      location: body.location,
      salary: body.salary,
      companyId: body.companyId,
    });
    if (!job) {
      return jsonResponse({ error: "Job not found" }, RESPONSE_CODES.NOT_FOUND);
    }
    return jsonResponse({ job });
  } catch (error) {
    return badRequestResponse(
      error instanceof Error ? error.message : "Invalid job data",
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const deleted = await softDeleteJob((await params).id);
  if (!deleted) {
    return jsonResponse({ error: "Job not found" }, RESPONSE_CODES.NOT_FOUND);
  }
  return jsonResponse({ success: true });
}
