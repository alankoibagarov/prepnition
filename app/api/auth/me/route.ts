import { jsonResponse, unauthorizedResponse } from "@/lib/auth/api";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return unauthorizedResponse();
  }

  return jsonResponse({ user: session });
}
