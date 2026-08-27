import { prisma } from "../../database";
import type { TxClient } from "../../database";
import type {
  TaskRecord,
  TaskRecurrenceType,
  TaskStatus,
} from "./task.types";

type DbClient = typeof prisma | TxClient;

async function findByOrg(
  orgId: string,
  db: DbClient = prisma,
): Promise<TaskRecord[]> {
  return db.task.findMany({
    where: {
      organization_id: orgId,
      deleted_at: null,
    },
    orderBy: { due_date: "asc" },
  });
}

async function findById(
  taskId: string,
  orgId: string,
  db: DbClient = prisma,
): Promise<TaskRecord | null> {
  return db.task.findFirst({
    where: { id: taskId, organization_id: orgId },
  });
}

async function create(data: {
  organization_id: string;
  due_date: Date;
  status: TaskStatus;
  recurrence_type: TaskRecurrenceType;
  predecessor_id?: string;
  notes: string | null;
}, db: DbClient = prisma): Promise<TaskRecord> {
  return db.task.create({ data });
}

async function update(
  taskId: string,
  data: {
    due_date?: Date;
    status?: TaskStatus;
    recurrence_type?: TaskRecurrenceType;
    notes?: string | null;
  },
  db: DbClient = prisma,
): Promise<TaskRecord> {
  return db.task.update({
    where: { id: taskId },
    data,
  });
}

async function completePending(
  taskId: string,
  orgId: string,
  db: DbClient,
) {
  return db.task.updateMany({
    where: {
      id: taskId,
      organization_id: orgId,
      status: "PENDING",
      deleted_at: null,
    },
    data: { status: "COMPLETED", updated_at: new Date() },
  });
}

async function softDelete(taskId: string): Promise<TaskRecord> {
  return prisma.task.update({
    where: { id: taskId },
    data: { deleted_at: new Date() },
  });
}

export {
  findByOrg,
  findById,
  create,
  update,
  completePending,
  softDelete,
};
