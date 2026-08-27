import { prisma } from "../../database";
import type { TxClient } from "../../database";

type DbClient = typeof prisma | TxClient;

async function findByOrganizationAndEmail(
  organizationId: string,
  email: string,
  db: DbClient,
) {
  return db.employeeInvitation.findUnique({
    where: {
      organization_id_email: { organization_id: organizationId, email },
    },
  });
}

async function findByTokenHash(tokenHash: string, db: DbClient) {
  return db.employeeInvitation.findUnique({ where: { token_hash: tokenHash } });
}

async function create(
  input: {
    organizationId: string;
    email: string;
    tokenHash: string;
    expiresAt: Date;
    createdByUserId: string;
  },
  db: DbClient,
) {
  return db.employeeInvitation.create({
    data: {
      organization_id: input.organizationId,
      email: input.email,
      token_hash: input.tokenHash,
      expires_at: input.expiresAt,
      created_by_user_id: input.createdByUserId,
    },
  });
}

async function resend(
  invitationId: string,
  input: { tokenHash: string; expiresAt: Date; createdByUserId: string },
  db: DbClient,
) {
  return db.employeeInvitation.update({
    where: { id: invitationId },
    data: {
      token_hash: input.tokenHash,
      expires_at: input.expiresAt,
      created_by_user_id: input.createdByUserId,
      updated_at: new Date(),
    },
  });
}

async function accept(
  invitationId: string,
  userId: string,
  db: DbClient,
) {
  return db.employeeInvitation.update({
    where: { id: invitationId },
    data: { accepted_at: new Date(), accepted_user_id: userId },
  });
}

export { findByOrganizationAndEmail, findByTokenHash, create, resend, accept };
