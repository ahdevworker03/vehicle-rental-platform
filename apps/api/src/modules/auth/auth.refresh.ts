import crypto from "node:crypto";
import { prisma } from "../../database";
import { authConfig } from "./auth.config";

function generateRefreshTokenValue(): string {
  return crypto.randomBytes(authConfig.REFRESH_TOKEN_LENGTH).toString("hex");
}

async function storeRefreshToken(userId: string): Promise<string> {
  const token = generateRefreshTokenValue();
  const expiresAt = new Date(Date.now() + authConfig.REFRESH_TOKEN_EXPIRY_MS);

  await prisma.refreshToken.create({
    data: {
      token,
      user_id: userId,
      expires_at: expiresAt,
    },
  });

  return token;
}

async function findRefreshToken(token: string) {
  return prisma.refreshToken.findUnique({
    where: { token },
    select: {
      id: true,
      token: true,
      user_id: true,
      expires_at: true,
    },
  });
}

async function deleteRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.delete({
    where: { token },
  });
}

function isTokenExpired(expiresAt: Date): boolean {
  return expiresAt < new Date();
}

export { storeRefreshToken, findRefreshToken, deleteRefreshToken, generateRefreshTokenValue, isTokenExpired };
