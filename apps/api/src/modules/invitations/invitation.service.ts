import { createHash, randomBytes } from "node:crypto";
import {
  isUniqueConstraintError,
  retrySerializable,
  transaction,
} from "../../database";
import { AppError } from "../../shared";
import { hashPassword, issueTokens } from "../auth";
import { recordAuditLog } from "../audit";
import * as repo from "./invitation.repository";
import type {
  AcceptEmployeeInvitationInput,
  CreateEmployeeInvitationInput,
  EmployeeInvitationResponse,
} from "./invitation.types";

const INVITATION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

function createToken(): string {
  return randomBytes(32).toString("base64url");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function emailAlreadyExistsError(): AppError {
  return new AppError(
    409,
    "EMAIL_ALREADY_EXISTS",
    "A user with this email already exists.",
  );
}

function invalidInvitationError(): AppError {
  return new AppError(
    409,
    "INVALID_OR_EXPIRED_INVITATION",
    "This invitation is invalid, expired, or has already been used.",
  );
}

function toResponse(
  invitation: {
    id: string;
    email: string;
    expires_at: Date;
    created_at: Date;
  },
  acceptanceToken: string,
): EmployeeInvitationResponse {
  return {
    id: invitation.id,
    email: invitation.email,
    role: "EMPLOYEE",
    expiresAt: invitation.expires_at.toISOString(),
    acceptanceToken,
    createdAt: invitation.created_at.toISOString(),
  };
}

async function createEmployeeInvitation(
  organizationId: string,
  actorUserId: string,
  input: CreateEmployeeInvitationInput,
): Promise<EmployeeInvitationResponse> {
  const acceptanceToken = createToken();
  const tokenHash = hashToken(acceptanceToken);
  const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_MS);

  const invitation = await transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });
    if (existingUser) throw emailAlreadyExistsError();

    const existingInvitation = await repo.findByOrganizationAndEmail(
      organizationId,
      input.email,
      tx,
    );

    if (existingInvitation?.accepted_at) throw emailAlreadyExistsError();

    const record = existingInvitation
      ? await repo.resend(
          existingInvitation.id,
          { tokenHash, expiresAt, createdByUserId: actorUserId },
          tx,
        )
      : await repo.create(
          {
            organizationId,
            email: input.email,
            tokenHash,
            expiresAt,
            createdByUserId: actorUserId,
          },
          tx,
        );

    await recordAuditLog(tx, {
      organizationId,
      actorUserId,
      action: existingInvitation
        ? "EMPLOYEE_INVITATION_RESENT"
        : "EMPLOYEE_INVITATION_CREATED",
      targetType: "EMPLOYEE_INVITATION",
      targetId: record.id,
      metadata: { email: input.email },
    });

    return record;
  });

  return toResponse(invitation, acceptanceToken);
}

async function acceptEmployeeInvitation(
  input: AcceptEmployeeInvitationInput,
) {
  const tokenHash = hashToken(input.token);
  const passwordHash = await hashPassword(input.password);

  async function run() {
    return transaction(
      async (tx) => {
        const invitation = await repo.findByTokenHash(tokenHash, tx);
        if (
          !invitation ||
          invitation.accepted_at ||
          invitation.expires_at <= new Date()
        ) {
          throw invalidInvitationError();
        }

        const existingUser = await tx.user.findUnique({
          where: { email: invitation.email },
          select: { id: true },
        });
        if (existingUser) throw emailAlreadyExistsError();

        const user = await tx.user.create({
          data: {
            email: invitation.email,
            password_hash: passwordHash,
            role: "EMPLOYEE",
            organization_id: invitation.organization_id,
          },
          select: { id: true, organization_id: true, role: true },
        });

        await repo.accept(invitation.id, user.id, tx);
        await recordAuditLog(tx, {
          organizationId: invitation.organization_id,
          actorUserId: user.id,
          action: "EMPLOYEE_INVITATION_ACCEPTED",
          targetType: "EMPLOYEE_INVITATION",
          targetId: invitation.id,
          metadata: { email: invitation.email },
        });

        return user;
      },
      { isolationLevel: "Serializable" },
    );
  }

  try {
    const user = await retrySerializable(run);
    return issueTokens(user.id, user.organization_id, user.role);
  } catch (error) {
    if (isUniqueConstraintError(error)) throw invalidInvitationError();
    throw error;
  }
}

export { createEmployeeInvitation, acceptEmployeeInvitation };
