export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

export const ACCESS_TOKEN_TTL = "15m";
export const REFRESH_TOKEN_TTL = "7d";

export const ACCESS_TOKEN_MAX_AGE = 24 * 60 * 60; // 24 hours
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

export const PROTECTED_PAGE_PREFIXES = ["/app"];
export const AUTH_PAGE_PREFIXES = ["/login"];
export const PROTECTED_API_PREFIX = "/api/protected";
