import { createHash, randomBytes } from "node:crypto";
import { retrySerializable, transaction } from "../../database";
import { AppError } from "../../shared";
import { recordAuditLog } from "../audit";
import { hashPassword } from "./auth.hash";
import { deliverPasswordReset } from "./password-reset.delivery";
import * as repo from "./password-reset.repository";

const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000;

function createToken(): string {
  return randomBytes(32).toString("base64url");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function invalidTokenError(): AppError {
  return new AppError(
    409,
    "INVALID_OR_EXPIRED_PASSWORD_RESET_TOKEN",
    "This password-reset token is invalid, expired, or has already been used.",
  );
}

async function requestPasswordReset(email: string): Promise<void> {
  const token = createToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);

  const user = await transaction(async (tx) => {
    const activeUser = await repo.findActiveUserByEmail(email, tx);
    if (!activeUser) return null;

    await repo.invalidateUnconsumedForUser(activeUser.id, tx);
    await repo.create({ userId: activeUser.id, tokenHash, expiresAt }, tx);
    return activeUser;
  });

  if (user) {
    await deliverPasswordReset(user.email, token);
  }
}

async function confirmPasswordReset(
  token: string,
  password: string,
): Promise<void> {
  const tokenHash = hashToken(token);
  const passwordHash = await hashPassword(password);

  async function run(): Promise<void> {
    await transaction(
      async (tx) => {
        const reset = await repo.findByTokenHash(tokenHash, tx);
        if (
          !reset ||
          reset.consumed_at ||
          reset.expires_at <= new Date() ||
          reset.user.deleted_at
        ) {
          throw invalidTokenError();
        }

        const consumed = await repo.consume(reset.id, tx);
        if (consumed.count !== 1) throw invalidTokenError();

        await repo.updatePassword(reset.user_id, passwordHash, tx);
        await repo.deleteRefreshTokens(reset.user_id, tx);
        await recordAuditLog(tx, {
          organizationId: reset.user.organization_id,
          actorUserId: reset.user_id,
          action: "PASSWORD_RESET_COMPLETED",
          targetType: "USER",
          targetId: reset.user_id,
        });
      },
      { isolationLevel: "Serializable" },
    );
  }

  await retrySerializable(run);
}

export { requestPasswordReset, confirmPasswordReset };
