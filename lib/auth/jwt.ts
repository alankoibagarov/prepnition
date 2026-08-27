import { jwtVerify, SignJWT } from "jose";
import type { TokenPayload } from "@/types/auth";
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from "./constants";

function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_ACCESS_SECRET must be set and at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_REFRESH_SECRET must be set and at least 32 characters",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    avatarUrl: payload.avatarUrl,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(getAccessSecret());
}

export async function signRefreshToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    avatarUrl: payload.avatarUrl,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_TTL)
    .sign(getRefreshSecret());
}

export async function verifyAccessToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret());
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      firstName:
        typeof payload.firstName === "string" ? payload.firstName : undefined,
      lastName:
        typeof payload.lastName === "string" ? payload.lastName : undefined,
      avatarUrl:
        typeof payload.avatarUrl === "string" ? payload.avatarUrl : undefined,
    };
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret());
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      firstName:
        typeof payload.firstName === "string" ? payload.firstName : undefined,
      lastName:
        typeof payload.lastName === "string" ? payload.lastName : undefined,
      avatarUrl:
        typeof payload.avatarUrl === "string" ? payload.avatarUrl : undefined,
    };
  } catch {
    return null;
  }
}
