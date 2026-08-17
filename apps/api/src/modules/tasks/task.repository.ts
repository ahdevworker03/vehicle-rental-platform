import { prisma } from "../../database";
import type {
  TaskRecord,
  TaskStatus,
} from "./task.types";

async function findByOrg(orgId: string): Promise<TaskRecord[]> {
  return prisma.task.findMany({
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
): Promise<TaskRecord | null> {
  return prisma.task.findFirst({
    where: { id: taskId, organization_id: orgId },
  });
}

async function create(data: {
  organization_id: string;
  due_date: Date;
  status: TaskStatus;
  notes: string | null;
}): Promise<TaskRecord> {
  return prisma.task.create({ data });
}

async function update(
  taskId: string,
  data: {
    due_date?: Date;
    status?: TaskStatus;
    notes?: string | null;
  },
): Promise<TaskRecord> {
  return prisma.task.update({
    where: { id: taskId },
    data,
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
  softDelete,
};
