import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from "./constants";

const isProduction = process.env.NODE_ENV === "production";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
};

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseCookieOptions,
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseCookieOptions,
    path: "/api/auth",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function setAccessCookie(
  response: NextResponse,
  accessToken: string,
): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseCookieOptions,
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    ...baseCookieOptions,
    path: "/",
    maxAge: 0,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    ...baseCookieOptions,
    path: "/api/auth",
    maxAge: 0,
  });
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}
