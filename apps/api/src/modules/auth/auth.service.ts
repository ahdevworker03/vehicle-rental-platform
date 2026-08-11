import { hashPassword, verifyPassword } from "./auth.hash";
import { generateAccessToken, verifyAccessToken } from "./auth.jwt";
import { storeRefreshToken, findRefreshToken, deleteRefreshToken, isTokenExpired } from "./auth.refresh";
import { prisma } from "../../database";
import { AppError } from "../../shared";
import type { AuthTokens, AccessTokenPayload } from "./auth.types";

async function issueTokens(
  userId: string,
  organizationId: string,
  role: string,
): Promise<AuthTokens> {
  const accessToken = generateAccessToken({
    sub: userId,
    org: organizationId,
    role,
  });

  const refreshToken = await storeRefreshToken(userId);

  return {
    accessToken,
    refreshToken,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  };
}

async function rotateRefreshToken(oldToken: string): Promise<AuthTokens> {
  const stored = await findRefreshToken(oldToken);

  if (!stored) {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Refresh token not found or already used.");
  }

  if (isTokenExpired(stored.expires_at)) {
    await deleteRefreshToken(oldToken);
    throw new AppError(401, "EXPIRED_REFRESH_TOKEN", "Refresh token has expired.");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: stored.user_id },
    select: { id: true, organization_id: true, role: true },
  });

  await deleteRefreshToken(oldToken);

  return issueTokens(user.id, user.organization_id, user.role);
}

async function revokeRefreshToken(token: string): Promise<void> {
  const stored = await findRefreshToken(token);

  if (!stored) {
    return;
  }

  await deleteRefreshToken(token);
}

async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { user_id: userId },
  });
}

export { hashPassword, verifyPassword, generateAccessToken, verifyAccessToken, issueTokens, rotateRefreshToken, revokeRefreshToken, revokeAllUserTokens };
export type { AuthTokens, AccessTokenPayload };
