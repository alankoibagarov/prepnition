import {
  deleteApplicationInterview,
  type InterviewUpdate,
  updateApplicationInterview,
} from "@/lib/applications";
import {
  badRequestResponse,
  jsonResponse,
  unauthorizedResponse,
} from "@/lib/auth/api";
import { RESPONSE_CODES } from "@/lib/auth/enums";
import { getSession } from "@/lib/auth/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; interviewId: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  try {
    const values = await params;
    const interview = await updateApplicationInterview(
      values.id,
      values.interviewId,
      session.id,
      (await request.json()) as InterviewUpdate,
    );
    if (!interview)
      return jsonResponse(
        { error: "Not found or not allowed" },
        RESPONSE_CODES.NOT_FOUND,
      );
    return jsonResponse({ interview });
  } catch (error) {
    return badRequestResponse(
      error instanceof Error ? error.message : "Invalid interview data",
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; interviewId: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const values = await params;
  const result = await deleteApplicationInterview(
    values.id,
    values.interviewId,
    session.id,
  );
  if (!result)
    return jsonResponse(
      { error: "Not found or not allowed" },
      RESPONSE_CODES.NOT_FOUND,
    );
  return jsonResponse(result);
}
