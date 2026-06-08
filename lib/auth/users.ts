import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { AuthUser, Role } from "@/types/auth";

export type StoredUser = AuthUser & {
  passwordHash: string;
};

/**
 * Find user by email, excluding soft-deleted users
 */
export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const user = await prisma.user.findFirst({
    where: {
      email: email.toLowerCase(),
      deletedAt: null,
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as Role,
  };
}

/**
 * Find user by ID, excluding soft-deleted users
 */
export async function findUserById(id: string): Promise<AuthUser | null> {
  const user = await prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as Role,
  };
}

/**
 * Validate user credentials (email and password)
 */
export async function validateCredentials(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const user = await prisma.user.findFirst({
    where: {
      email: email.toLowerCase(),
      deletedAt: null,
    },
  });

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as Role,
  };
}

/**
 * Create a new user with hashed password
 */
export async function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: Role = "user",
): Promise<AuthUser> {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      passwordHash,
      role,
    },
  });

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as Role,
  };
}

/**
 * Get user by session token
 */
export async function getUserBySessionToken(
  sessionToken: string,
): Promise<AuthUser | null> {
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || session.user.deletedAt) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    role: session.user.role as Role,
  };
}

/**
 * Create a session for a user
 */
export async function createSession(
  userId: string,
  expiresAt: Date,
): Promise<string> {
  const sessionToken = generateSessionToken();

  await prisma.session.create({
    data: {
      userId,
      sessionToken,
      expiresAt,
    },
  });

  return sessionToken;
}

/**
 * Delete a session by token
 */
export async function deleteSessionByToken(
  sessionToken: string,
): Promise<void> {
  await prisma.session.deleteMany({
    where: { sessionToken },
  });
}

/**
 * Generate a random session token
 */
function generateSessionToken(): string {
  return require("crypto").randomBytes(32).toString("hex");
}
