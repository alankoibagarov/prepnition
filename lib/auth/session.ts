import { redirect } from "next/navigation";
import type { AuthUser } from "@/types/auth";
import { getAccessToken } from "./cookies";
import { verifyAccessToken } from "./jwt";

export async function getSession(): Promise<AuthUser | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return null;
  }

  const payload = await verifyAccessToken(accessToken);
  if (!payload) {
    return null;
  }

  return {
    id: payload.sub,
    email: payload.email,
    firstName: payload.firstName || "",
    lastName: payload.lastName || "",
    avatarUrl: payload.avatarUrl || "",
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
