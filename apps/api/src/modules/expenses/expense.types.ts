import type { Decimal } from "@prisma/client/runtime/client";

export type ExpenseCategory =
  | "FUEL"
  | "INSURANCE"
  | "REGISTRATION"
  | "CLEANING"
  | "OTHER";

export interface ExpenseRecord {
  id: string;
  organization_id: string;
  vehicle_id: string | null;
  expense_date: Date;
  amount: Decimal;
  category: ExpenseCategory;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ExpenseResponse {
  id: string;
  vehicleId: string | null;
  expenseDate: string;
  amount: number;
  category: ExpenseCategory;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseInput {
  vehicle_id?: string;
  expense_date: Date;
  amount: number;
  category: ExpenseCategory;
  description?: string;
}

export interface UpdateExpenseInput {
  vehicle_id?: string | null;
  expense_date?: Date;
  amount?: number;
  category?: ExpenseCategory;
  description?: string | null;
}
