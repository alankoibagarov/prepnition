import { type NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  PROTECTED_API_PREFIX,
} from "@/lib/auth/constants";
import { getUserBySessionToken } from "@/lib/auth/users";
import { RESPONSE_CODES } from "./lib/auth/enums";

export async function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const user = sessionToken ? await getUserBySessionToken(sessionToken) : null;

  if (user) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", user.id);
    requestHeaders.set("x-user-role", user.role);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const { pathname } = request.nextUrl;

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
