export type Role = "user" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
};

export type TokenPayload = {
  sub: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
};

export type RefreshTokenPayload = {
  sub: string;
};
