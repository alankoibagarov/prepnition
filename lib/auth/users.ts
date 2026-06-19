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
