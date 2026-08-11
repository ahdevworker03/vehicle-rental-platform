export interface AccessTokenPayload {
  sub: string;
  org: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}
