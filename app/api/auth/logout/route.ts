import { jsonResponse } from "@/lib/auth/api";
import { clearAuthCookies, getAccessToken } from "@/lib/auth/cookies";
import { deleteSessionByToken } from "@/lib/auth/users";

export async function POST() {
  const sessionToken = await getAccessToken();
  if (sessionToken) {
    await deleteSessionByToken(sessionToken);
  }

  const response = jsonResponse({ success: true });
  clearAuthCookies(response);
  return response;
}
