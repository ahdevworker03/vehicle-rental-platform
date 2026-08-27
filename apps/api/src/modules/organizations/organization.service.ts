import { AppError } from "../../shared";
import { transaction } from "../../database";
import { recordAuditLog } from "../audit";
import * as repo from "./organization.repository";
import type {
  OrganizationResponse,
  UpdateOrganizationInput,
} from "./organization.types";

function toResponse(record: {
  id: string;
  name: string;
  status: "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED";
  legal_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  contract_footer_text: string | null;
  created_at: Date;
  updated_at: Date;
}): OrganizationResponse {
  return {
    id: record.id,
    name: record.name,
    status: record.status,
    legalName: record.legal_name,
    phone: record.phone,
    email: record.email,
    address: record.address,
    contractFooterText: record.contract_footer_text,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}

async function updateOrganizationStatus(
  orgId: string,
  actorUserId: string,
  status: OrganizationResponse["status"],
): Promise<OrganizationResponse> {
  const organization = await transaction(async (tx) => {
    const org = await repo.findByIdWithinTx(orgId, tx);

    if (!org || org.deleted_at) {
      throw new AppError(
        404,
        "ORGANIZATION_NOT_FOUND",
        "Organization not found.",
      );
    }

    if (org.status === status) {
      return org;
    }

    const updated = await repo.updateStatusWithinTx(orgId, status, tx);
    await recordAuditLog(tx, {
      organizationId: updated.id,
      actorUserId,
      action: "ORGANIZATION_STATUS_UPDATED",
      targetType: "ORGANIZATION",
      targetId: updated.id,
      metadata: {
        previousStatus: org.status,
        newStatus: updated.status,
      },
    });

    return updated;
  });

  return toResponse(organization);
}

async function getOrganization(orgId: string): Promise<OrganizationResponse> {
  const org = await repo.findById(orgId);

  if (!org || org.deleted_at) {
    throw new AppError(
      404,
      "ORGANIZATION_NOT_FOUND",
      "Organization not found.",
    );
  }

  return toResponse(org);
}

async function updateOrganization(
  orgId: string,
  input: UpdateOrganizationInput,
): Promise<OrganizationResponse> {
  const org = await repo.findById(orgId);

  if (!org || org.deleted_at) {
    throw new AppError(
      404,
      "ORGANIZATION_NOT_FOUND",
      "Organization not found.",
    );
  }

  const updated = await repo.update(orgId, input);

  return toResponse(updated);
}

async function deleteOrganization(orgId: string): Promise<void> {
  const org = await repo.findById(orgId);

  if (!org || org.deleted_at) {
    throw new AppError(
      404,
      "ORGANIZATION_NOT_FOUND",
      "Organization not found.",
    );
  }

  throw new AppError(
    409,
    "CANNOT_DELETE_ORGANIZATION",
    "You cannot delete your own organization.",
  );
}

export {
  getOrganization,
  updateOrganization,
  updateOrganizationStatus,
  deleteOrganization,
};
