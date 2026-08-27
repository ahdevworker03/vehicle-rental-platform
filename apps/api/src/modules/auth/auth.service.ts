import { hashPassword, verifyPassword } from "./auth.hash";
import { generateAccessToken, verifyAccessToken } from "./auth.jwt";
import {
  storeRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  isTokenExpired,
} from "./auth.refresh";
import { prisma, transaction, isUniqueConstraintError } from "../../database";
import { AppError } from "../../shared";
import type { AuthTokens, AccessTokenPayload } from "./auth.types";
import type { UserRole } from "../users/user.types";

function emailAlreadyExistsError(): AppError {
  return new AppError(
    409,
    "EMAIL_ALREADY_EXISTS",
    "A user with this email already exists.",
  );
}

async function registerOrganization(
  email: string,
  password: string,
  organizationName: string,
): Promise<AuthTokens> {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw emailAlreadyExistsError();
  }

  const passwordHash = await hashPassword(password);

  let user: { id: string; organization_id: string; role: UserRole };

  try {
    user = await transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingUser) {
        throw emailAlreadyExistsError();
      }

      const organization = await tx.organization.create({
        data: { name: organizationName },
      });

      return tx.user.create({
        data: {
          email,
          password_hash: passwordHash,
          role: "OWNER",
          organization_id: organization.id,
        },
        select: {
          id: true,
          organization_id: true,
          role: true,
        },
      });
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw emailAlreadyExistsError();
    }
    throw err;
  }

  return issueTokens(user.id, user.organization_id, user.role);
}

async function login(email: string, password: string): Promise<AuthTokens> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password_hash: true,
      role: true,
      organization_id: true,
      deleted_at: true,
    },
  });

  if (!user) {
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid email or password.",
    );
  }

  if (user.deleted_at) {
    throw new AppError(
      401,
      "ACCOUNT_DEACTIVATED",
      "This account has been deactivated.",
    );
  }

  const valid = await verifyPassword(password, user.password_hash);

  if (!valid) {
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid email or password.",
    );
  }

  return issueTokens(user.id, user.organization_id, user.role);
}

async function getCurrentUser(accessToken: string) {
  const payload = verifyAccessToken(accessToken);

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      role: true,
      organization_id: true,
      created_at: true,
      organization: { select: { status: true } },
    },
  });

  return user;
}

async function issueTokens(
  userId: string,
  organizationId: string,
  role: UserRole,
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
    throw new AppError(
      401,
      "INVALID_REFRESH_TOKEN",
      "Refresh token not found or already used.",
    );
  }

  if (isTokenExpired(stored.expires_at)) {
    await deleteRefreshToken(oldToken);
    throw new AppError(
      401,
      "EXPIRED_REFRESH_TOKEN",
      "Refresh token has expired.",
    );
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

export {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  verifyAccessToken,
  registerOrganization,
  login,
  getCurrentUser,
  issueTokens,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};
export type { AuthTokens, AccessTokenPayload };
