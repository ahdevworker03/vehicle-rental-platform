import type { UserRole } from "../users/user.types";

export interface AccessTokenPayload {
  sub: string;
  org: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}
