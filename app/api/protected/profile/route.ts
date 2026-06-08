import { headers } from "next/headers";
import { jsonResponse } from "@/lib/auth/api";

export async function GET() {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("x-user-id");
  const userRole = requestHeaders.get("x-user-role");

  return jsonResponse({
    message: "Protected API response",
    userId,
    userRole,
  });
}
