import prisma from "@workspace/db";
import { logger } from "../config";

async function connect(): Promise<void> {
  await prisma.$connect();
  logger.info("Database connection established");
}

async function disconnect(): Promise<void> {
  await prisma.$disconnect();
  logger.info("Database connection closed");
}

export { prisma, connect, disconnect };
