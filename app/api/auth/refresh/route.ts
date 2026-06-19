import { jsonResponse, unauthorizedResponse } from "@/lib/auth/api";
import { getRefreshToken, setAccessCookie } from "@/lib/auth/cookies";
import { signAccessToken, verifyRefreshToken } from "@/lib/auth/jwt";
import { findUserById } from "@/lib/auth/users";

export async function POST() {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return unauthorizedResponse("Refresh token missing");
  }

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    return unauthorizedResponse("Refresh token invalid or expired");
  }

  const user = await findUserById(payload.sub);
  if (!user) {
    return unauthorizedResponse("User not found or deleted");
  }

  // Issue a new Access Token
  const newAccessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  });

  const response = jsonResponse({ user });
  setAccessCookie(response, newAccessToken);
  return response;
}
