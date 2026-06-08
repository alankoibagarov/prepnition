import { cookies } from "next/headers";
import { jsonResponse, unauthorizedResponse } from "@/lib/auth/api";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";
import { setAccessCookie } from "@/lib/auth/cookies";
import { signAccessToken, verifyRefreshToken } from "@/lib/auth/jwt";
import { findUserById } from "@/lib/auth/users";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return unauthorizedResponse("Refresh token missing");
  }

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    return unauthorizedResponse("Invalid refresh token");
  }

  const user = findUserById(payload.sub);
  if (!user) {
    return unauthorizedResponse("User not found");
  }

  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const response = jsonResponse({ success: true });
  setAccessCookie(response, accessToken);
  return response;
}
