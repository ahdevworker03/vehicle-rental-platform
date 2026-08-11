import { prisma } from "../../database";
import type { OrganizationRecord } from "./organization.types";

async function findById(orgId: string): Promise<OrganizationRecord | null> {
  return prisma.organization.findUnique({
    where: { id: orgId },
  });
}

async function update(orgId: string, data: { name: string }): Promise<OrganizationRecord> {
  return prisma.organization.update({
    where: { id: orgId },
    data: { name: data.name },
  });
}

async function softDelete(orgId: string): Promise<OrganizationRecord> {
  return prisma.organization.update({
    where: { id: orgId },
    data: { deleted_at: new Date() },
  });
}

export { findById, update, softDelete };
