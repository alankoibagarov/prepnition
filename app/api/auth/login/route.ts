import {
  badRequestResponse,
  jsonResponse,
  unauthorizedResponse,
} from "@/lib/auth/api";
import { setAccessCookie, clearAuthCookies } from "@/lib/auth/cookies";
import { validateCredentials, createSession } from "@/lib/auth/users";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse("Invalid JSON body");
  }

  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    return badRequestResponse("Email and password are required");
  }

  const user = await validateCredentials(email, password);
  if (!user) {
    return unauthorizedResponse("Invalid email or password");
  }

  // Create session that expires in 7 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  const sessionToken = await createSession(user.id, expiresAt);

  const response = jsonResponse({ user });
  setAccessCookie(response, sessionToken);
  return response;
}
