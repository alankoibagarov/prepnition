import {
  badRequestResponse,
  jsonResponse,
  unauthorizedResponse,
} from "@/lib/auth/api";
import { RESPONSE_CODES } from "@/lib/auth/enums";
import { getSession } from "@/lib/auth/session";
import {
  getInterviewById,
  softDeleteInterview,
  updateInterview,
} from "@/lib/interviews";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const id = params.id;
  const interview = await getInterviewById(id, session.id);
  if (!interview)
    return jsonResponse({ error: "Not found" }, RESPONSE_CODES.NOT_FOUND);

  return jsonResponse({ interview });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("Invalid JSON body");
  }

  const updated = await updateInterview(params.id, session.id, body);
  if (!updated)
    return jsonResponse(
      { error: "Not found or not allowed" },
      RESPONSE_CODES.NOT_FOUND,
    );

  return jsonResponse({ interview: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const deleted = await softDeleteInterview(params.id, session.id);
  if (!deleted)
    return jsonResponse(
      { error: "Not found or not allowed" },
      RESPONSE_CODES.NOT_FOUND,
    );

  return jsonResponse({ success: true });
}
