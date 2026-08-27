import { prisma } from "../../database";
import type { TxClient } from "../../database";

type DbClient = typeof prisma | TxClient;

async function findActiveUserByEmail(email: string, db: DbClient) {
  return db.user.findFirst({
    where: { email, deleted_at: null },
    select: { id: true, email: true, organization_id: true },
  });
}

async function invalidateUnconsumedForUser(userId: string, db: DbClient) {
  return db.passwordResetToken.updateMany({
    where: { user_id: userId, consumed_at: null },
    data: { consumed_at: new Date() },
  });
}

async function create(
  input: { userId: string; tokenHash: string; expiresAt: Date },
  db: DbClient,
) {
  return db.passwordResetToken.create({
    data: {
      user_id: input.userId,
      token_hash: input.tokenHash,
      expires_at: input.expiresAt,
    },
  });
}

async function findByTokenHash(tokenHash: string, db: DbClient) {
  return db.passwordResetToken.findUnique({
    where: { token_hash: tokenHash },
    include: {
      user: {
        select: { id: true, organization_id: true, deleted_at: true },
      },
    },
  });
}

async function consume(tokenId: string, db: DbClient) {
  return db.passwordResetToken.updateMany({
    where: { id: tokenId, consumed_at: null },
    data: { consumed_at: new Date() },
  });
}

async function updatePassword(userId: string, passwordHash: string, db: DbClient) {
  return db.user.update({
    where: { id: userId },
    data: { password_hash: passwordHash },
  });
}

async function deleteRefreshTokens(userId: string, db: DbClient) {
  return db.refreshToken.deleteMany({ where: { user_id: userId } });
}

export {
  findActiveUserByEmail,
  invalidateUnconsumedForUser,
  create,
  findByTokenHash,
  consume,
  updatePassword,
  deleteRefreshTokens,
};
