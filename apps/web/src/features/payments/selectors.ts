import type { PaymentResponse, RentalResponse } from "@workspace/api-client-react";

/**
 * Total revenue from recorded payments within a month/year, using `paymentDate`.
 * Mirrors the expenses period convention (`getExpenseTotalForPeriod`).
 */
export function getPaymentRevenueForPeriod(
  payments: PaymentResponse[],
  month: number,
  year: number,
): number {
  return payments.reduce((sum, p) => {
    const d = new Date(p.paymentDate);
    return d.getMonth() === month && d.getFullYear() === year ? sum + p.amount : sum;
  }, 0);
}

/**
 * Total revenue per vehicle for a month/year, derived from recorded payments
 * mapped to their vehicle through the payment's rental.
 */
export function getPaymentRevenuePerVehicle(
  payments: PaymentResponse[],
  rentals: RentalResponse[],
  month: number,
  year: number,
): Record<string, number> {
  const vehicleByRentalId = new Map(rentals.map((r) => [r.id, r.vehicleId]));

  const byVehicle: Record<string, number> = {};
  for (const p of payments) {
    const d = new Date(p.paymentDate);
    if (d.getMonth() !== month || d.getFullYear() !== year) continue;

    const vehicleId = vehicleByRentalId.get(p.rentalId);
    if (!vehicleId) continue;

    byVehicle[vehicleId] = (byVehicle[vehicleId] ?? 0) + p.amount;
  }
  return byVehicle;
}

/** Total recorded payment revenue per vehicle across all loaded records. */
export function getLifetimePaymentRevenuePerVehicle(
  payments: PaymentResponse[],
  rentals: RentalResponse[],
): Record<string, number> {
  const vehicleByRentalId = new Map(rentals.map((r) => [r.id, r.vehicleId]));
  const byVehicle: Record<string, number> = {};

  for (const payment of payments) {
    const vehicleId = vehicleByRentalId.get(payment.rentalId);
    if (!vehicleId) continue;
    byVehicle[vehicleId] = (byVehicle[vehicleId] ?? 0) + payment.amount;
  }

  return byVehicle;
}

/** A single rental's authoritative outstanding balance returned by the API. */
export interface RentalOutstandingBalance {
  rentalId: string;
  customerId: string;
  outstandingBalance: number;
}

/**
 * Aggregate outstanding balance = sum of API-provided per-rental
 * `outstandingBalance` values. No client-side totalAmount - payments math.
 */
export function getTotalOutstanding(
  balances: RentalOutstandingBalance[],
): number {
  return balances.reduce((sum, b) => sum + b.outstandingBalance, 0);
}

/**
 * Outstanding balance per customer, keyed by customer id, from API-provided
 * per-rental balances. Only positive balances represent money still owed.
 */
export function getOutstandingPerCustomer(
  balances: RentalOutstandingBalance[],
): Record<string, number> {
  const byCustomer: Record<string, number> = {};
  for (const b of balances) {
    if (b.outstandingBalance <= 0) continue;
    byCustomer[b.customerId] = (byCustomer[b.customerId] ?? 0) + b.outstandingBalance;
  }
  return byCustomer;
}
