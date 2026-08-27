export type AuditAction =
  | "ORGANIZATION_STATUS_UPDATED"
  | "EMPLOYEE_INVITATION_CREATED"
  | "EMPLOYEE_INVITATION_RESENT"
  | "EMPLOYEE_INVITATION_ACCEPTED";

export type AuditTargetType = "ORGANIZATION" | "EMPLOYEE_INVITATION";

export type AuditMetadata = Record<string, string | number | boolean | null>;

export interface CreateAuditLogInput {
  organizationId?: string;
  actorUserId?: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId?: string;
  metadata?: AuditMetadata;
}
