import { prisma } from "./prisma";
import type { TransactionClient } from "@workspace/db";

async function transaction<T>(
  queries: (tx: TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(queries);
}

export { transaction };
export type { TransactionClient as TxClient };
