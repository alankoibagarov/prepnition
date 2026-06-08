import bcrypt from "bcryptjs";
import type { AuthUser } from "@/types/auth";

// TODO: swap for DB-backed user store (e.g. Prisma adapter)
type StoredUser = AuthUser & {
  passwordHash: string;
};

const DEMO_PASSWORD = "password";

const demoUsers: StoredUser[] = [
  {
    id: "1",
    email: "user@demo.com",
    role: "user",
    passwordHash: bcrypt.hashSync(DEMO_PASSWORD, 10),
  },
  {
    id: "2",
    email: "admin@demo.com",
    role: "admin",
    passwordHash: bcrypt.hashSync(DEMO_PASSWORD, 10),
  },
];

export function findUserByEmail(email: string): AuthUser | null {
  const user = demoUsers.find(
    (entry) => entry.email.toLowerCase() === email.toLowerCase(),
  );
  if (!user) {
    return null;
  }
  return { id: user.id, email: user.email, role: user.role };
}

export function findUserById(id: string): AuthUser | null {
  const user = demoUsers.find((entry) => entry.id === id);
  if (!user) {
    return null;
  }
  return { id: user.id, email: user.email, role: user.role };
}

export async function validateCredentials(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const user = demoUsers.find(
    (entry) => entry.email.toLowerCase() === email.toLowerCase(),
  );
  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return { id: user.id, email: user.email, role: user.role };
}
