import {
  badRequestResponse,
  jsonResponse,
  unauthorizedResponse,
} from "@/lib/auth/api";
import { RESPONSE_CODES } from "@/lib/auth/enums";
import { getSession } from "@/lib/auth/session";
import {
  getInterviewById,
  getInterviewHistory,
  softDeleteInterview,
  updateInterview,
} from "@/lib/interviews";

export async function GET(request: any, { params }: any) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const interview = await getInterviewById(id, session.id);
  if (!interview)
    return jsonResponse({ error: "Not found" }, RESPONSE_CODES.NOT_FOUND);

  const history = await getInterviewHistory(id, session.id);
  return jsonResponse({ interview, history });
}

export async function PATCH(request: any, { params }: any) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  let body: any;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("Invalid JSON body");
  }

  const updated = await updateInterview(id, session.id, body);
  if (!updated)
    return jsonResponse(
      { error: "Not found or not allowed" },
      RESPONSE_CODES.NOT_FOUND,
    );

  const history = await getInterviewHistory(id, session.id);

  return jsonResponse({ interview: updated, history });
}

export async function DELETE(request: any, { params }: any) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const deleted = await softDeleteInterview(id, session.id);
  if (!deleted)
    return jsonResponse(
      { error: "Not found or not allowed" },
      RESPONSE_CODES.NOT_FOUND,
    );

  return jsonResponse({ success: true });
}
