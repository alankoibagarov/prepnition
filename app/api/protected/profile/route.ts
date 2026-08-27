import { headers } from "next/headers";
import { jsonResponse } from "@/lib/auth/api";

export async function GET() {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("x-user-id");

  return jsonResponse({
    message: "Protected API response",
    userId,
  });
}
