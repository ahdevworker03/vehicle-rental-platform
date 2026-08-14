import { prisma } from "./prisma";
import type { TransactionClient } from "@workspace/db";

interface TransactionOptions {
  isolationLevel?: "ReadUncommitted" | "ReadCommitted" | "RepeatableRead" | "Serializable";
}

async function transaction<T>(
  queries: (tx: TransactionClient) => Promise<T>,
  options?: TransactionOptions,
): Promise<T> {
  return prisma.$transaction(queries, options);
}

export { transaction };
export type { TransactionClient as TxClient };
