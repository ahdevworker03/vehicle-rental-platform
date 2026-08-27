export type AuditAction = "ORGANIZATION_STATUS_UPDATED";

export type AuditTargetType = "ORGANIZATION";

export type AuditMetadata = Record<string, string | number | boolean | null>;

export interface CreateAuditLogInput {
  organizationId?: string;
  actorUserId?: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId?: string;
  metadata?: AuditMetadata;
}
