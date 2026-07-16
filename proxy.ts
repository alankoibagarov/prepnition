import { type NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  PROTECTED_API_PREFIX,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/constants";
import {
  signAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/auth/jwt";
import { RESPONSE_CODES } from "./lib/auth/enums";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  let payload = accessToken ? await verifyAccessToken(accessToken) : null;

  // If access token is invalid/expired, try to refresh
  if (!payload) {
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (refreshToken) {
      const refreshPayload = await verifyRefreshToken(refreshToken);

      if (refreshPayload) {
        try {
          // Issue a new access token
          const newAccessToken = await signAccessToken(refreshPayload);

          // Verify the new token
          payload = await verifyAccessToken(newAccessToken);

          if (payload) {
            // Token refresh successful; create response with headers
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set("x-user-id", payload.sub);
            requestHeaders.set("x-user-role", payload.role);
            requestHeaders.set("x-access-token", newAccessToken);

            const response = NextResponse.next({
              request: { headers: requestHeaders },
            });

            // Set cookie on the response that will be returned
            response.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 24 * 60 * 60, // 24 hours
            });

            return response;
          }
        } catch {
          // Token refresh failed
        }
      }
    }
  }

  if (payload) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.sub);
    requestHeaders.set("x-user-role", payload.role);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (pathname.startsWith(PROTECTED_API_PREFIX)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: RESPONSE_CODES.UNAUTHORIZED },
    );
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/app/:path*", "/api/protected/:path*"],
};
