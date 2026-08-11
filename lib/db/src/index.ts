import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client.js";
import type { ITXClientDenyList } from "@prisma/client/runtime/client.js";

const connectionString = process.env["DATABASE_URL"];

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

type TransactionClient = Omit<PrismaClient, ITXClientDenyList>;

export { PrismaClientKnownRequestError };
export type { TransactionClient };

export default prisma;
