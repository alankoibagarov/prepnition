import { jsonResponse } from "@/lib/auth/api";
import { clearAuthCookies } from "@/lib/auth/cookies";

export async function POST() {
  const response = jsonResponse({ success: true });
  clearAuthCookies(response);
  return response;
}
