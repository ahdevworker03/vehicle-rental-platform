import { prisma } from "../../database";
import type { TxClient } from "../../database";
import type {
  OrganizationRecord,
  OrganizationStatus,
  UpdateOrganizationInput,
} from "./organization.types";

type DbClient = typeof prisma | TxClient;

async function findById(orgId: string): Promise<OrganizationRecord | null> {
  return prisma.organization.findUnique({
    where: { id: orgId },
  });
}

async function update(
  orgId: string,
  data: UpdateOrganizationInput,
): Promise<OrganizationRecord> {
  return prisma.organization.update({
    where: { id: orgId },
    data: {
      name: data.name,
      legal_name: data.legalName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      contract_footer_text: data.contractFooterText,
    },
  });
}

async function findByIdWithinTx(
  orgId: string,
  tx: DbClient,
): Promise<OrganizationRecord | null> {
  return tx.organization.findUnique({
    where: { id: orgId },
  });
}

async function updateStatusWithinTx(
  orgId: string,
  status: OrganizationStatus,
  tx: DbClient,
): Promise<OrganizationRecord> {
  return tx.organization.update({
    where: { id: orgId },
    data: { status },
  });
}

async function softDelete(orgId: string): Promise<OrganizationRecord> {
  return prisma.organization.update({
    where: { id: orgId },
    data: { deleted_at: new Date() },
  });
}

export {
  findById,
  findByIdWithinTx,
  update,
  updateStatusWithinTx,
  softDelete,
};
