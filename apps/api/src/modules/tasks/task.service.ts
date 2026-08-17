import { AppError } from "../../shared";
import * as repo from "./task.repository";
import type {
  TaskResponse,
  CreateTaskInput,
  UpdateTaskInput,
  TaskRecord,
} from "./task.types";

function toResponse(record: TaskRecord): TaskResponse {
  return {
    id: record.id,
    dueDate: record.due_date.toISOString(),
    status: record.status,
    notes: record.notes,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}

async function listTasks(orgId: string): Promise<TaskResponse[]> {
  const tasks = await repo.findByOrg(orgId);
  return tasks.map(toResponse);
}

async function getTask(taskId: string, orgId: string): Promise<TaskResponse> {
  const record = await repo.findById(taskId, orgId);

  if (!record || record.deleted_at) {
    throw new AppError(404, "TASK_NOT_FOUND", "Task not found.");
  }

  return toResponse(record);
}

async function createTask(
  orgId: string,
  input: CreateTaskInput,
): Promise<TaskResponse> {
  const record = await repo.create({
    organization_id: orgId,
    due_date: input.due_date,
    status: "PENDING",
    notes: input.notes ?? null,
  });

  return toResponse(record);
}

async function updateTask(
  taskId: string,
  orgId: string,
  input: UpdateTaskInput,
): Promise<TaskResponse> {
  const record = await repo.findById(taskId, orgId);

  if (!record || record.deleted_at) {
    throw new AppError(404, "TASK_NOT_FOUND", "Task not found.");
  }

  const updated = await repo.update(taskId, {
    ...(input.due_date !== undefined ? { due_date: input.due_date } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
  });

  return toResponse(updated);
}

async function completeTask(
  taskId: string,
  orgId: string,
): Promise<TaskResponse> {
  const record = await repo.findById(taskId, orgId);

  if (!record || record.deleted_at) {
    throw new AppError(404, "TASK_NOT_FOUND", "Task not found.");
  }

  if (record.status === "COMPLETED") {
    throw new AppError(409, "TASK_ALREADY_COMPLETED", "Task is already completed.");
  }

  const updated = await repo.update(taskId, { status: "COMPLETED" });

  return toResponse(updated);
}

async function deleteTask(taskId: string, orgId: string): Promise<void> {
  const record = await repo.findById(taskId, orgId);

  if (!record || record.deleted_at) {
    throw new AppError(404, "TASK_NOT_FOUND", "Task not found.");
  }

  await repo.softDelete(taskId);
}

export {
  listTasks,
  getTask,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
};
