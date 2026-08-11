import { AppError } from "../../shared";
import * as repo from "./organization.repository";
import type { OrganizationResponse, UpdateOrganizationInput } from "./organization.types";

function toResponse(record: {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}): OrganizationResponse {
  return {
    id: record.id,
    name: record.name,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}

async function getOrganization(orgId: string): Promise<OrganizationResponse> {
  const org = await repo.findById(orgId);

  if (!org || org.deleted_at) {
    throw new AppError(404, "ORGANIZATION_NOT_FOUND", "Organization not found.");
  }

  return toResponse(org);
}

async function updateOrganization(
  orgId: string,
  input: UpdateOrganizationInput,
): Promise<OrganizationResponse> {
  const org = await repo.findById(orgId);

  if (!org || org.deleted_at) {
    throw new AppError(404, "ORGANIZATION_NOT_FOUND", "Organization not found.");
  }

  const updated = await repo.update(orgId, input);

  return toResponse(updated);
}

async function deleteOrganization(orgId: string): Promise<void> {
  const org = await repo.findById(orgId);

  if (!org || org.deleted_at) {
    throw new AppError(404, "ORGANIZATION_NOT_FOUND", "Organization not found.");
  }

  await repo.softDelete(orgId);
}

export { getOrganization, updateOrganization, deleteOrganization };
