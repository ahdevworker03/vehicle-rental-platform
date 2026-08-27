import { Prisma } from "@prisma/client";
import type { TxClient } from "../../database";
import type { CreateAuditLogInput } from "./audit.types";

async function create(
  tx: TxClient,
  input: CreateAuditLogInput,
): Promise<void> {
  await tx.auditLog.create({
    data: {
      organization_id: input.organizationId,
      actor_user_id: input.actorUserId,
      action: input.action,
      target_type: input.targetType,
      target_id: input.targetId,
      metadata: input.metadata
        ? (input.metadata as Prisma.InputJsonValue)
        : undefined,
    },
  });
}

export { create };
