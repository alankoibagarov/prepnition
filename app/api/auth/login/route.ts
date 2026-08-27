import {
  badRequestResponse,
  jsonResponse,
  unauthorizedResponse,
} from "@/lib/auth/api";
import { setAuthCookies } from "@/lib/auth/cookies";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { validateCredentials } from "@/lib/auth/users";

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

  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });
  const refreshToken = await signRefreshToken({
    sub: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  const response = jsonResponse({ user });
  setAuthCookies(response, accessToken, refreshToken);
  return response;
}
