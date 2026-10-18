import {
  badRequestResponse,
  jsonResponse,
  unauthorizedResponse,
} from "@/lib/auth/api";
import { RESPONSE_CODES } from "@/lib/auth/enums";
import { getSession } from "@/lib/auth/session";
import { softDeleteCompany, updateCompany } from "@/lib/companies";

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
    const company = await updateCompany((await params).id, {
      name: body.name,
      url: body.url,
    });
    return jsonResponse({ company });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid company data";
    if (message === "Company was not found") {
      return jsonResponse({ error: message }, RESPONSE_CODES.NOT_FOUND);
    }
    return badRequestResponse(message);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  try {
    await softDeleteCompany((await params).id);
    return jsonResponse({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete company";
    if (message === "Company was not found") {
      return jsonResponse({ error: message }, RESPONSE_CODES.NOT_FOUND);
    }
    return badRequestResponse(message);
  }
}
