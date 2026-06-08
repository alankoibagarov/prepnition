import { jsonResponse, unauthorizedResponse } from "@/lib/auth/api";
import { getAccessToken } from "@/lib/auth/cookies";
import { getUserBySessionToken } from "@/lib/auth/users";

export async function POST() {
  const sessionToken = await getAccessToken();

  if (!sessionToken) {
    return unauthorizedResponse("Session token missing");
  }

  const user = await getUserBySessionToken(sessionToken);
  if (!user) {
    return unauthorizedResponse("Session invalid or expired");
  }

  return jsonResponse({ user });
}
