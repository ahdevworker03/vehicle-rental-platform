import type { Request, Response, NextFunction } from "express";
import {
  listPayments,
  listRentalPayments,
  createPayment,
} from "./payment.service";
import { ok, created } from "../../shared";
import type { CreatePaymentInput } from "./payment.validation";

async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const payments = await listPayments(req.user!.org);
    ok(res, payments);
  } catch (err) {
    next(err);
  }
}

async function listByRental(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const rentalId = req.params.rentalId as string;
    const result = await listRentalPayments(rentalId, req.user!.org);
    ok(res, {
      payments: result.payments,
      outstandingBalance: result.outstandingBalance,
    });
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
    const rentalId = req.params.rentalId as string;
    const input = req.body as CreatePaymentInput;
    const payment = await createPayment(rentalId, req.user!.org, input);
    created(res, payment);
  } catch (err) {
    next(err);
  }
}

export {
  list,
  listByRental,
  create,
};
