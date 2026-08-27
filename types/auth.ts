export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type TokenPayload = {
  sub: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

export type RefreshTokenPayload = {
  sub: string;
};
