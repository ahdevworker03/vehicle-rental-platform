import { AppError } from "../../shared";
import * as repo from "./expense.repository";
import type {
  ExpenseResponse,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseRecord,
  ExpenseCategory,
} from "./expense.types";

const VALID_CATEGORIES: ExpenseCategory[] = [
  "FUEL",
  "INSURANCE",
  "REGISTRATION",
  "CLEANING",
  "OTHER",
];

function toResponse(record: ExpenseRecord): ExpenseResponse {
  return {
    id: record.id,
    vehicleId: record.vehicle_id,
    expenseDate: record.expense_date.toISOString(),
    amount: Number(record.amount.toString()),
    category: record.category,
    description: record.description,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}

function assertValidCategory(category: string): void {
  if (!VALID_CATEGORIES.includes(category as ExpenseCategory)) {
    throw new AppError(
      422,
      "INVALID_EXPENSE_CATEGORY",
      `Invalid expense category: ${category}.`,
    );
  }
}

function assertValidAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new AppError(
      422,
      "INVALID_EXPENSE_AMOUNT",
      "Expense amount must be a non-negative number.",
    );
  }
}

async function resolveVehicle(
  vehicleId: string | null | undefined,
  orgId: string,
): Promise<string | null> {
  if (!vehicleId) return null;

  const vehicle = await repo.findVehicle(vehicleId, orgId);

  if (!vehicle) {
    throw new AppError(404, "VEHICLE_NOT_FOUND", "Vehicle not found.");
  }

  return vehicle.id;
}

async function listExpenses(
  orgId: string,
  vehicleId?: string,
): Promise<ExpenseResponse[]> {
  const expenses = await repo.findByOrg(orgId, vehicleId);
  return expenses.map(toResponse);
}

async function getExpense(
  expenseId: string,
  orgId: string,
): Promise<ExpenseResponse> {
  const expense = await repo.findById(expenseId, orgId);

  if (!expense || expense.deleted_at) {
    throw new AppError(404, "EXPENSE_NOT_FOUND", "Expense not found.");
  }

  return toResponse(expense);
}

async function createExpense(
  orgId: string,
  input: CreateExpenseInput,
): Promise<ExpenseResponse> {
  assertValidCategory(input.category);
  assertValidAmount(input.amount);

  const vehicleId = await resolveVehicle(input.vehicle_id, orgId);

  const expense = await repo.create({
    organization_id: orgId,
    vehicle_id: vehicleId,
    expense_date: input.expense_date,
    amount: input.amount,
    category: input.category,
    description: input.description ?? null,
  });

  return toResponse(expense);
}

async function updateExpense(
  expenseId: string,
  orgId: string,
  input: UpdateExpenseInput,
): Promise<ExpenseResponse> {
  const expense = await repo.findById(expenseId, orgId);

  if (!expense || expense.deleted_at) {
    throw new AppError(404, "EXPENSE_NOT_FOUND", "Expense not found.");
  }

  if (input.category !== undefined) {
    assertValidCategory(input.category);
  }
  if (input.amount !== undefined) {
    assertValidAmount(input.amount);
  }

  let vehicleId: string | null | undefined;
  if (input.vehicle_id !== undefined) {
    vehicleId = await resolveVehicle(input.vehicle_id, orgId);
  }

  const updated = await repo.update(expenseId, {
    ...(input.expense_date !== undefined
      ? { expense_date: input.expense_date }
      : {}),
    ...(input.amount !== undefined ? { amount: input.amount } : {}),
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
    ...(vehicleId !== undefined ? { vehicle_id: vehicleId } : {}),
  });

  return toResponse(updated);
}

async function deleteExpense(expenseId: string, orgId: string): Promise<void> {
  const expense = await repo.findById(expenseId, orgId);

  if (!expense || expense.deleted_at) {
    throw new AppError(404, "EXPENSE_NOT_FOUND", "Expense not found.");
  }

  await repo.softDelete(expenseId);
}

export {
  listExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
};
