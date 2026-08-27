import {
  isUniqueConstraintError,
  retrySerializable,
  transaction,
} from "../../database";
import { AppError } from "../../shared";
import * as repo from "./task.repository";
import type {
  TaskResponse,
  CreateTaskInput,
  UpdateTaskInput,
  TaskRecord,
  TaskRecurrenceType,
} from "./task.types";

function toResponse(record: TaskRecord): TaskResponse {
  return {
    id: record.id,
    dueDate: record.due_date.toISOString(),
    status: record.status,
    recurrenceType: record.recurrence_type,
    predecessorId: record.predecessor_id,
    notes: record.notes,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}

function taskNotFoundError(): AppError {
  return new AppError(404, "TASK_NOT_FOUND", "Task not found.");
}

function taskAlreadyCompletedError(): AppError {
  return new AppError(409, "TASK_ALREADY_COMPLETED", "Task is already completed.");
}

function recurrenceUpdateAfterCompletionError(): AppError {
  return new AppError(
    409,
    "TASK_RECURRENCE_CANNOT_CHANGE_AFTER_COMPLETION",
    "A completed task's recurrence cannot be changed.",
  );
}

function nextDueDate(
  dueDate: Date,
  recurrenceType: Exclude<TaskRecurrenceType, "NONE">,
): Date {
  const next = new Date(dueDate);

  if (recurrenceType === "DAILY") {
    next.setUTCDate(next.getUTCDate() + 1);
    return next;
  }

  if (recurrenceType === "WEEKLY") {
    next.setUTCDate(next.getUTCDate() + 7);
    return next;
  }

  next.setUTCDate(1);
  next.setUTCMonth(next.getUTCMonth() + 1);
  const lastDay = new Date(
    Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0),
  ).getUTCDate();
  next.setUTCDate(Math.min(dueDate.getUTCDate(), lastDay));
  return next;
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
    recurrence_type: input.recurrence_type ?? "NONE",
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
    throw taskNotFoundError();
  }

  if (input.recurrence_type !== undefined && record.status === "COMPLETED") {
    throw recurrenceUpdateAfterCompletionError();
  }

  const updated = await repo.update(taskId, {
    ...(input.due_date !== undefined ? { due_date: input.due_date } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(input.recurrence_type !== undefined
      ? { recurrence_type: input.recurrence_type }
      : {}),
  });

  return toResponse(updated);
}

async function completeTask(
  taskId: string,
  orgId: string,
): Promise<TaskResponse> {
  async function run(): Promise<TaskResponse> {
    return transaction(
      async (tx) => {
        const record = await repo.findById(taskId, orgId, tx);

        if (!record || record.deleted_at) throw taskNotFoundError();
        if (record.status === "COMPLETED") throw taskAlreadyCompletedError();

        const completed = await repo.completePending(taskId, orgId, tx);
        if (completed.count !== 1) throw taskAlreadyCompletedError();

        if (record.recurrence_type !== "NONE") {
          await repo.create(
            {
              organization_id: orgId,
              due_date: nextDueDate(record.due_date, record.recurrence_type),
              status: "PENDING",
              recurrence_type: record.recurrence_type,
              predecessor_id: record.id,
              notes: record.notes,
            },
            tx,
          );
        }

        const updated = await repo.findById(taskId, orgId, tx);
        if (!updated) throw taskNotFoundError();
        return toResponse(updated);
      },
      { isolationLevel: "Serializable" },
    );
  }

  try {
    return await retrySerializable(run);
  } catch (error) {
    if (isUniqueConstraintError(error)) throw taskAlreadyCompletedError();
    throw error;
  }
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
