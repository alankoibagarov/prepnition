import { redirect } from "next/navigation";
import type { AuthUser, Role } from "@/types/auth";
import { requireAuth } from "./session";

export function hasRole(user: AuthUser, role: Role): boolean {
  return user.role === role;
}

export async function requireRole(role: Role): Promise<AuthUser> {
  const session = await requireAuth();
  console.log("Checking role for user:", session.email, "Required role:", role);
  if (!hasRole(session, role)) {
    redirect("/unauthorized");
  }
  return session;
}
