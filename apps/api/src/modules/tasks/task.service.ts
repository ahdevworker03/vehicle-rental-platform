import {
  isUniqueConstraintError,
  retrySerializable,
  transaction,
} from "../../database";
import { AppError } from "../../shared";
import * as repo from "./task.repository";
import { beirutBusinessDate, nextTaskDueDate } from "./task-recurrence";
import type {
  CreateTaskInput,
  TaskRecord,
  TaskRecurrenceUnit,
  TaskResponse,
  UpdateTaskInput,
} from "./task.types";

function toResponse(record: TaskRecord): TaskResponse {
  return {
    id: record.id,
    dueDate: record.due_date.toISOString(),
    status: record.status,
    recurrenceInterval: record.recurrence_interval,
    recurrenceUnit: record.recurrence_unit,
    recurrenceEndDate:
      record.recurrence_end_date?.toISOString().slice(0, 10) ?? null,
    recurrenceEndCount: record.recurrence_end_count,
    occurrenceNumber: record.occurrence_number,
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
  return new AppError(
    409,
    "TASK_ALREADY_COMPLETED",
    "Task is already completed.",
  );
}

function recurrenceUpdateAfterCompletionError(): AppError {
  return new AppError(
    409,
    "TASK_RECURRENCE_CANNOT_CHANGE_AFTER_COMPLETION",
    "A completed task's recurrence cannot be changed.",
  );
}

function recurrenceIsConfigured(input: {
  recurrence_interval: number | null;
  recurrence_unit: TaskRecurrenceUnit | null;
}): boolean {
  return input.recurrence_interval !== null && input.recurrence_unit !== null;
}

function validateRecurrence(input: {
  recurrence_interval: number | null;
  recurrence_unit: TaskRecurrenceUnit | null;
  recurrence_end_date: Date | null;
  recurrence_end_count: number | null;
}): void {
  const hasInterval = input.recurrence_interval !== null;
  const hasUnit = input.recurrence_unit !== null;
  const hasEndCondition =
    input.recurrence_end_date !== null || input.recurrence_end_count !== null;

  if (
    hasInterval !== hasUnit ||
    (input.recurrence_interval !== null && input.recurrence_interval < 1) ||
    (input.recurrence_end_count !== null && input.recurrence_end_count < 1) ||
    (input.recurrence_end_date !== null &&
      input.recurrence_end_count !== null) ||
    (hasEndCondition && !hasInterval)
  ) {
    throw new AppError(
      422,
      "TASK_RECURRENCE_INVALID",
      "Task recurrence configuration is invalid.",
    );
  }
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
  const recurrence = {
    recurrence_interval: input.recurrence_interval ?? null,
    recurrence_unit: input.recurrence_unit ?? null,
    recurrence_end_date: input.recurrence_end_date ?? null,
    recurrence_end_count: input.recurrence_end_count ?? null,
  };
  validateRecurrence(recurrence);

  const record = await repo.create({
    organization_id: orgId,
    due_date: input.due_date,
    status: "PENDING",
    ...recurrence,
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

  const changesRecurrence =
    input.recurrence_interval !== undefined ||
    input.recurrence_unit !== undefined ||
    input.recurrence_end_date !== undefined ||
    input.recurrence_end_count !== undefined;
  if (changesRecurrence && record.status === "COMPLETED") {
    throw recurrenceUpdateAfterCompletionError();
  }

  const recurrence = {
    recurrence_interval:
      input.recurrence_interval === undefined
        ? record.recurrence_interval
        : input.recurrence_interval,
    recurrence_unit:
      input.recurrence_unit === undefined
        ? record.recurrence_unit
        : input.recurrence_unit,
    recurrence_end_date:
      input.recurrence_end_date === undefined
        ? record.recurrence_end_date
        : input.recurrence_end_date,
    recurrence_end_count:
      input.recurrence_end_count === undefined
        ? record.recurrence_end_count
        : input.recurrence_end_count,
  };
  validateRecurrence(recurrence);

  const updated = await repo.update(taskId, orgId, {
    ...(input.due_date !== undefined ? { due_date: input.due_date } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(changesRecurrence ? recurrence : {}),
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

        if (recurrenceIsConfigured(record)) {
          const candidateDueDate = nextTaskDueDate(
            record.due_date,
            record.recurrence_interval!,
            record.recurrence_unit!,
          );
          const countAllowsSuccessor =
            record.recurrence_end_count === null ||
            record.occurrence_number < record.recurrence_end_count;
          const dateAllowsSuccessor =
            record.recurrence_end_date === null ||
            beirutBusinessDate(candidateDueDate) <=
              record.recurrence_end_date.toISOString().slice(0, 10);

          if (countAllowsSuccessor && dateAllowsSuccessor) {
            await repo.create(
              {
                organization_id: orgId,
                due_date: candidateDueDate,
                status: "PENDING",
                recurrence_interval: record.recurrence_interval,
                recurrence_unit: record.recurrence_unit,
                recurrence_end_date: record.recurrence_end_date,
                recurrence_end_count: record.recurrence_end_count,
                occurrence_number: record.occurrence_number + 1,
                predecessor_id: record.id,
                notes: record.notes,
              },
              tx,
            );
          }
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

  await repo.softDelete(taskId, orgId);
}

export { listTasks, getTask, createTask, updateTask, completeTask, deleteTask };
