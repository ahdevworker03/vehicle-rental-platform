const ACCESS_TOKEN_KEY = "vrap.accessToken";
const REFRESH_TOKEN_KEY = "vrap.refreshToken";
const ACCESS_TOKEN_EXPIRY_KEY = "vrap.accessTokenExpiresAt";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(
  accessToken: string,
  refreshToken: string,
  expiresAt?: string,
): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (expiresAt) localStorage.setItem(ACCESS_TOKEN_EXPIRY_KEY, expiresAt);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_EXPIRY_KEY);
}
