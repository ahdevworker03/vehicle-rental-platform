import type { Request, Response, NextFunction } from "express";
import {
  listExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} from "./expense.service";
import { ok, created, noContent } from "../../shared";
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
  ListExpensesQuery,
} from "./expense.validation";

async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = req.query as ListExpensesQuery;
    const expenses = await listExpenses(req.user!.org, query.vehicleId);
    ok(res, expenses);
  } catch (err) {
    next(err);
  }
}

async function get(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const expense = await getExpense(id, req.user!.org);
    ok(res, expense);
  } catch (err) {
    next(err);
  }
}

async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as CreateExpenseInput;
    const expense = await createExpense(req.user!.org, input);
    created(res, expense);
  } catch (err) {
    next(err);
  }
}

async function update(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const input = req.body as UpdateExpenseInput;
    const expense = await updateExpense(id, req.user!.org, input);
    ok(res, expense);
  } catch (err) {
    next(err);
  }
}

async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    await deleteExpense(id, req.user!.org);
    noContent(res);
  } catch (err) {
    next(err);
  }
}

export {
  list,
  get,
  create,
  update,
  remove,
};
