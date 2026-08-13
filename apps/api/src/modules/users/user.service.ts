import { hashPassword } from "../auth";
import { AppError } from "../../shared";
import * as repo from "./user.repository";
import type { UserResponse, CreateUserInput, UpdateUserInput } from "./user.types";

function toResponse(record: { id: string; email: string; role: string; created_at: Date; updated_at: Date }): UserResponse {
  return {
    id: record.id,
    email: record.email,
    role: record.role,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}

async function listUsers(orgId: string): Promise<UserResponse[]> {
  const users = await repo.findByOrg(orgId);
  return users.map(toResponse);
}

async function getUser(userId: string, orgId: string): Promise<UserResponse> {
  const user = await repo.findById(userId, orgId);

  if (!user || user.deleted_at) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found.");
  }

  return toResponse(user);
}

async function createUser(
  orgId: string,
  input: CreateUserInput,
): Promise<UserResponse> {
  const existing = await repo.findByEmail(input.email);

  if (existing) {
    throw new AppError(409, "EMAIL_ALREADY_EXISTS", "A user with this email already exists.");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await repo.create(input, passwordHash, orgId);

  return toResponse(user);
}

async function updateUser(
  userId: string,
  orgId: string,
  input: UpdateUserInput,
): Promise<UserResponse> {
  const user = await repo.findById(userId, orgId);

  if (!user || user.deleted_at) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found.");
  }

  const updated = await repo.update(userId, input);

  return toResponse(updated);
}

async function deleteUser(userId: string, orgId: string, actorUserId: string): Promise<void> {
  const user = await repo.findById(userId, orgId);

  if (!user || user.deleted_at) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found.");
  }

  if (userId === actorUserId) {
    throw new AppError(409, "CANNOT_DELETE_SELF", "You cannot delete your own account.");
  }

  await repo.softDelete(userId);
}

export { listUsers, getUser, createUser, updateUser, deleteUser };
