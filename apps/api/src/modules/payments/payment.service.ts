import { AppError } from "../../shared";
import { Decimal } from "@prisma/client/runtime/client";
import * as repo from "./payment.repository";
import type {
  PaymentResponse,
  CreatePaymentInput,
  PaymentRecord,
  PaymentMethod,
  RentalPaymentsResult,
} from "./payment.types";

const VALID_METHODS: PaymentMethod[] = [
  "CASH",
  "CARD",
  "TRANSFER",
  "OTHER",
];

function toResponse(record: PaymentRecord): PaymentResponse {
  return {
    id: record.id,
    rentalId: record.rental_id,
    amount: Number(record.amount.toString()),
    paymentDate: record.payment_date.toISOString(),
    method: record.method,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}

function assertValidMethod(method: string): void {
  if (!VALID_METHODS.includes(method as PaymentMethod)) {
    throw new AppError(
      422,
      "INVALID_PAYMENT_METHOD",
      `Invalid payment method: ${method}.`,
    );
  }
}

function assertValidAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError(
      422,
      "INVALID_PAYMENT_AMOUNT",
      "Payment amount must be a number strictly greater than zero.",
    );
  }
}

async function listPayments(
  orgId: string,
): Promise<PaymentResponse[]> {
  const payments = await repo.findByOrg(orgId);
  return payments.map(toResponse);
}

async function listRentalPayments(
  rentalId: string,
  orgId: string,
): Promise<RentalPaymentsResult> {
  const rental = await repo.findRental(rentalId, orgId);

  if (!rental) {
    throw new AppError(404, "RENTAL_NOT_FOUND", "Rental not found.");
  }

  const payments = await repo.findByRental(rentalId, orgId);

  // Sum and subtraction are performed in Decimal arithmetic to avoid
  // binary floating-point errors on monetary values.
  const totalPaid = payments.reduce(
    (sum, p) => sum.plus(p.amount),
    new Decimal(0),
  );
  const outstandingBalance = rental.total_amount.minus(totalPaid);

  return {
    payments: payments.map(toResponse),
    outstandingBalance: outstandingBalance.toNumber(),
  };
}

async function createPayment(
  rentalId: string,
  orgId: string,
  input: CreatePaymentInput,
): Promise<PaymentResponse> {
  assertValidMethod(input.method);
  assertValidAmount(input.amount);

  const rental = await repo.findRental(rentalId, orgId);

  if (!rental) {
    throw new AppError(404, "RENTAL_NOT_FOUND", "Rental not found.");
  }

  const payment = await repo.create({
    organization_id: orgId,
    rental_id: rentalId,
    amount: input.amount,
    payment_date: input.payment_date,
    method: input.method,
  });

  return toResponse(payment);
}

export {
  listPayments,
  listRentalPayments,
  createPayment,
};
