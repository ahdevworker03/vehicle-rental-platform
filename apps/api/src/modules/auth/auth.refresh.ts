import crypto from "node:crypto";
import { prisma } from "../../database";
import { authConfig } from "./auth.config";

function generateRefreshTokenValue(): string {
  return crypto.randomBytes(authConfig.REFRESH_TOKEN_LENGTH).toString("hex");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function storeRefreshToken(userId: string): Promise<string> {
  const rawToken = generateRefreshTokenValue();
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + authConfig.REFRESH_TOKEN_EXPIRY_MS);

  await prisma.refreshToken.create({
    data: {
      token: hashedToken,
      user_id: userId,
      expires_at: expiresAt,
    },
  });

  return rawToken;
}

async function findRefreshToken(rawToken: string) {
  const hashedToken = hashToken(rawToken);

  return prisma.refreshToken.findUnique({
    where: { token: hashedToken },
    select: {
      id: true,
      user_id: true,
      expires_at: true,
    },
  });
}

async function deleteRefreshToken(rawToken: string): Promise<void> {
  const hashedToken = hashToken(rawToken);

  await prisma.refreshToken.delete({
    where: { token: hashedToken },
  });
}

function isTokenExpired(expiresAt: Date): boolean {
  return expiresAt < new Date();
}

export {
  storeRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  generateRefreshTokenValue,
  isTokenExpired,
};
