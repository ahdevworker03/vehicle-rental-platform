import type { Request, Response, NextFunction } from "express";
import {
  listRentals,
  getRental,
  createRental,
  updateRental,
  pickupRental,
  returnRental,
  extendRental,
  cancelRental,
  deleteRental,
  checkAvailability,
} from "./rental.service";
import { ok, created, noContent } from "../../shared";
import type {
  CreateRentalInput,
  UpdateRentalInput,
  ListRentalsQuery,
  CheckAvailabilityQuery,
} from "./rental.validation";

async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = req.query as ListRentalsQuery;
    const rentals = await listRentals(req.user!.org, query.search);
    ok(res, rentals);
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
    const rental = await getRental(id, req.user!.org);
    ok(res, rental);
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
    const input = req.body as CreateRentalInput;
    const rental = await createRental(req.user!.org, input);
    created(res, rental);
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
    const input = req.body as UpdateRentalInput;
    const rental = await updateRental(id, req.user!.org, input);
    ok(res, rental);
  } catch (err) {
    next(err);
  }
}

async function pickup(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { actual_pickup_date } = req.body as { actual_pickup_date: Date };
    const rental = await pickupRental(
      id,
      req.user!.org,
      new Date(actual_pickup_date),
    );
    ok(res, rental);
  } catch (err) {
    next(err);
  }
}

async function ret(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { actual_return_date } = req.body as { actual_return_date: Date };
    const rental = await returnRental(
      id,
      req.user!.org,
      new Date(actual_return_date),
    );
    ok(res, rental);
  } catch (err) {
    next(err);
  }
}

async function extend(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { expected_return_date } = req.body as { expected_return_date: Date };
    const rental = await extendRental(
      id,
      req.user!.org,
      new Date(expected_return_date),
    );
    ok(res, rental);
  } catch (err) {
    next(err);
  }
}

async function cancel(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const rental = await cancelRental(id, req.user!.org);
    ok(res, rental);
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
    await deleteRental(id, req.user!.org);
    noContent(res);
  } catch (err) {
    next(err);
  }
}

async function availability(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = req.query as unknown as CheckAvailabilityQuery;
    const result = await checkAvailability(
      req.user!.org,
      query.vehicleId,
      new Date(query.pickupDate),
      new Date(query.expectedReturnDate),
      query.excludeRentalId,
    );
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export {
  list,
  get,
  create,
  update,
  pickup,
  ret,
  extend,
  cancel,
  remove,
  availability,
};
