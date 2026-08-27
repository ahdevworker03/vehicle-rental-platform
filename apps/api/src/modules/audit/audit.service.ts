import type { TxClient } from "../../database";
import * as repo from "./audit.repository";
import type { CreateAuditLogInput } from "./audit.types";

async function recordAuditLog(
  tx: TxClient,
  input: CreateAuditLogInput,
): Promise<void> {
  await repo.create(tx, input);
}

export { recordAuditLog };
