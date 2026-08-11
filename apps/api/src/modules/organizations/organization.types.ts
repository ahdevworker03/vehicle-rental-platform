export interface OrganizationRecord {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganizationInput {
  name: string;
}
