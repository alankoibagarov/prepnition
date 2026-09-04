import {
  createApplicationInterview,
  type InterviewInput,
} from "@/lib/applications";
import {
  badRequestResponse,
  jsonResponse,
  unauthorizedResponse,
} from "@/lib/auth/api";
import { RESPONSE_CODES } from "@/lib/auth/enums";
import { getSession } from "@/lib/auth/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  try {
    const body = (await request.json()) as InterviewInput;
    if (!body.type || !body.title)
      return badRequestResponse("Interview type and title are required");
    const interview = await createApplicationInterview(
      (await params).id,
      session.id,
      body,
    );
    if (!interview)
      return jsonResponse(
        { error: "Not found or not allowed" },
        RESPONSE_CODES.NOT_FOUND,
      );
    return jsonResponse({ interview }, RESPONSE_CODES.CREATED);
  } catch (error) {
    return badRequestResponse(
      error instanceof Error ? error.message : "Invalid interview data",
    );
  }
}
