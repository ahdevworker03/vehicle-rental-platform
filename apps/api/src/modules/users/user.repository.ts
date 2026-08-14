import { prisma } from "../../database";
import type {
  UserRecord,
  CreateUserInput,
  UpdateUserInput,
} from "./user.types";

async function findByOrg(orgId: string): Promise<UserRecord[]> {
  return prisma.user.findMany({
    where: { organization_id: orgId, deleted_at: null },
    orderBy: { created_at: "asc" },
  });
}

async function findById(
  userId: string,
  orgId: string,
): Promise<UserRecord | null> {
  return prisma.user.findFirst({
    where: { id: userId, organization_id: orgId },
  });
}

async function findByEmail(email: string): Promise<UserRecord | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}

async function create(
  data: CreateUserInput,
  passwordHash: string,
  orgId: string,
): Promise<UserRecord> {
  return prisma.user.create({
    data: {
      email: data.email,
      password_hash: passwordHash,
      role: data.role,
      organization_id: orgId,
    },
  });
}

async function update(
  userId: string,
  data: UpdateUserInput,
): Promise<UserRecord> {
  return prisma.user.update({
    where: { id: userId },
    data: { role: data.role },
  });
}

async function softDelete(userId: string): Promise<UserRecord> {
  return prisma.user.update({
    where: { id: userId },
    data: { deleted_at: new Date() },
  });
}

export { findByOrg, findById, findByEmail, create, update, softDelete };
