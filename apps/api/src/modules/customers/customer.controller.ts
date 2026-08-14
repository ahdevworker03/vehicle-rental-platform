import type { Request, Response, NextFunction } from "express";
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "./customer.service";
import { ok, created, noContent } from "../../shared";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
  ListCustomersQuery,
} from "./customer.validation";

async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = req.query as ListCustomersQuery;
    const customers = await listCustomers(req.user!.org, query.search);
    ok(res, customers);
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
    const customer = await getCustomer(id, req.user!.org);
    ok(res, customer);
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
    const input = req.body as CreateCustomerInput;
    const customer = await createCustomer(req.user!.org, input);
    created(res, customer);
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
    const input = req.body as UpdateCustomerInput;
    const customer = await updateCustomer(id, req.user!.org, input);
    ok(res, customer);
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
    await deleteCustomer(id, req.user!.org);
    noContent(res);
  } catch (err) {
    next(err);
  }
}

export { list, get, create, update, remove };
