import { prisma } from "../../database";
import type {
  ExpenseRecord,
  ExpenseCategory,
} from "./expense.types";

async function findByOrg(
  orgId: string,
  vehicleId?: string,
): Promise<ExpenseRecord[]> {
  return prisma.expense.findMany({
    where: {
      organization_id: orgId,
      deleted_at: null,
      ...(vehicleId ? { vehicle_id: vehicleId } : {}),
    },
    orderBy: { expense_date: "desc" },
  });
}

async function findById(
  expenseId: string,
  orgId: string,
): Promise<ExpenseRecord | null> {
  return prisma.expense.findFirst({
    where: { id: expenseId, organization_id: orgId },
  });
}

async function findVehicle(
  vehicleId: string,
  orgId: string,
): Promise<{ id: string } | null> {
  return prisma.vehicle.findFirst({
    where: { id: vehicleId, organization_id: orgId, deleted_at: null },
    select: { id: true },
  });
}

async function create(data: {
  organization_id: string;
  vehicle_id: string | null;
  expense_date: Date;
  amount: number;
  category: ExpenseCategory;
  description: string | null;
}): Promise<ExpenseRecord> {
  return prisma.expense.create({ data });
}

async function update(
  expenseId: string,
  data: {
    vehicle_id?: string | null;
    expense_date?: Date;
    amount?: number;
    category?: ExpenseCategory;
    description?: string | null;
  },
): Promise<ExpenseRecord> {
  return prisma.expense.update({
    where: { id: expenseId },
    data,
  });
}

async function softDelete(expenseId: string): Promise<ExpenseRecord> {
  return prisma.expense.update({
    where: { id: expenseId },
    data: { deleted_at: new Date() },
  });
}

export {
  findByOrg,
  findById,
  findVehicle,
  create,
  update,
  softDelete,
};
