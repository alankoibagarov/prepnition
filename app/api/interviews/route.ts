import {
  badRequestResponse,
  jsonResponse,
  unauthorizedResponse,
} from "@/lib/auth/api";
import { RESPONSE_CODES } from "@/lib/auth/enums";
import { getSession } from "@/lib/auth/session";
import { createInterview, getInterviewsForUser } from "@/lib/interviews";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const interviews = await getInterviewsForUser(session.id);
  return jsonResponse({ interviews });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("Invalid JSON body");
  }

  const title = (body.title || "").trim();
  if (!title) return badRequestResponse("Title is required");

  const created = await createInterview(session.id, {
    title,
    company: body.company,
    position: body.position,
    scheduledAt: body.scheduledAt ?? null,
    status: body.status ?? undefined,
    notes: body.notes,
  });

  return jsonResponse({ interview: created }, RESPONSE_CODES.CREATED);
}
