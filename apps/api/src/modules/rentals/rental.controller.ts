import type { Request, Response, NextFunction } from "express";
import { listRentals, getRental, createRental, updateRental, deleteRental } from "./rental.service";
import { ok, created, noContent } from "../../shared";
import type { CreateRentalInput, UpdateRentalInput, ListRentalsQuery } from "./rental.validation";

async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = req.query as ListRentalsQuery;
    const rentals = await listRentals(req.user!.org, query.search);
    ok(res, rentals);
  } catch (err) {
    next(err);
  }
}

async function get(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const rental = await getRental(id, req.user!.org);
    ok(res, rental);
  } catch (err) {
    next(err);
  }
}

async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as CreateRentalInput;
    const rental = await createRental(req.user!.org, input);
    created(res, rental);
  } catch (err) {
    next(err);
  }
}

async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const input = req.body as UpdateRentalInput;
    const rental = await updateRental(id, req.user!.org, input);
    ok(res, rental);
  } catch (err) {
    next(err);
  }
}

async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    await deleteRental(id, req.user!.org);
    noContent(res);
  } catch (err) {
    next(err);
  }
}

export { list, get, create, update, remove };
