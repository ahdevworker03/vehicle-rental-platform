import {
  CreateExpenseBody,
  UpdateExpenseBody,
  ListExpensesQueryParams,
} from "@workspace/api-zod";
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
} from "./expense.types";

export const createExpenseSchema = CreateExpenseBody;
export const updateExpenseSchema = UpdateExpenseBody;
export const listExpensesQuerySchema = ListExpensesQueryParams;

export type ListExpensesQuery = { vehicleId?: string };

export type { CreateExpenseInput, UpdateExpenseInput };
