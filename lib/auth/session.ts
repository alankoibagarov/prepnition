import { redirect } from "next/navigation";
import type { AuthUser } from "@/types/auth";
import { getAccessToken } from "./cookies";
import { getUserBySessionToken } from "./users";

export async function getSession(): Promise<AuthUser | null> {
  const sessionToken = await getAccessToken();
  if (!sessionToken) {
    return null;
  }

  const user = await getUserBySessionToken(sessionToken);
  return user;
}

export async function requireAuth(): Promise<AuthUser> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
