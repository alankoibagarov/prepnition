import {
  type ApplicationDetailUpdate,
  deleteApplication,
  getApplicationDetail,
  updateApplicationDetail,
} from "@/lib/applications";
import {
  badRequestResponse,
  jsonResponse,
  unauthorizedResponse,
} from "@/lib/auth/api";
import { RESPONSE_CODES } from "@/lib/auth/enums";
import { getSession } from "@/lib/auth/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const application = await getApplicationDetail((await params).id, session.id);
  if (!application)
    return jsonResponse({ error: "Not found" }, RESPONSE_CODES.NOT_FOUND);
  return jsonResponse({ application });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  let body: ApplicationDetailUpdate;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("Invalid JSON body");
  }
  try {
    const application = await updateApplicationDetail(
      (await params).id,
      session.id,
      body,
    );
    if (!application)
      return jsonResponse(
        { error: "Not found or not allowed" },
        RESPONSE_CODES.NOT_FOUND,
      );
    return jsonResponse({ application });
  } catch (error) {
    return badRequestResponse(
      error instanceof Error ? error.message : "Invalid application data",
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const deleted = await deleteApplication(id, session.id);
  if (!deleted)
    return jsonResponse(
      { error: "Not found or not allowed" },
      RESPONSE_CODES.NOT_FOUND,
    );

  return jsonResponse({ success: true });
}
