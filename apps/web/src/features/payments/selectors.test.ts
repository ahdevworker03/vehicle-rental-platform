import { describe, it, expect } from "vitest";
import type { PaymentResponse, RentalResponse } from "@workspace/api-client-react";
import {
  getPaymentRevenueForPeriod,
  getPaymentRevenuePerVehicle,
  getLifetimePaymentRevenuePerVehicle,
  getTotalOutstanding,
  getOutstandingPerCustomer,
} from "./selectors";

function makePayment(overrides: Partial<PaymentResponse>): PaymentResponse {
  return {
    id: `p-${Math.random()}`,
    rentalId: "r1",
    amount: 50,
    paymentDate: "2026-08-15T12:00:00Z",
    method: "CASH",
    createdAt: "2026-08-15T12:00:00Z",
    updatedAt: "2026-08-15T12:00:00Z",
    ...overrides,
  };
}

function makeRental(overrides: Partial<RentalResponse>): RentalResponse {
  return {
    id: "r1",
    customerId: "c1",
    vehicleId: "v1",
    pickupDate: "2026-08-01T09:00:00Z",
    expectedReturnDate: "2026-08-10T09:00:00Z",
    status: "ACTIVE",
    dailyRate: 50,
    totalAmount: 350,
    depositAmount: 100,
    createdAt: "2026-08-01T09:00:00Z",
    updatedAt: "2026-08-01T09:00:00Z",
    ...overrides,
  };
}

describe("getPaymentRevenueForPeriod", () => {
  it("sums recorded payment amounts for the given month and year", () => {
    const payments = [
      makePayment({ amount: 100, paymentDate: "2026-08-10T12:00:00Z" }),
      makePayment({ amount: 50.5, paymentDate: "2026-08-20T12:00:00Z" }),
      makePayment({ amount: 25, paymentDate: "2026-08-31T12:00:00Z" }),
    ];
    expect(getPaymentRevenueForPeriod(payments, 7, 2026)).toBe(175.5);
  });

  it("excludes payments outside the selected period", () => {
    const payments = [
      makePayment({ amount: 100, paymentDate: "2026-07-31T12:00:00Z" }),
      makePayment({ amount: 200, paymentDate: "2026-09-01T12:00:00Z" }),
      makePayment({ amount: 50, paymentDate: "2026-08-15T12:00:00Z" }),
    ];
    expect(getPaymentRevenueForPeriod(payments, 7, 2026)).toBe(50);
  });

  it("excludes the same month in a different year", () => {
    const payments = [makePayment({ amount: 100, paymentDate: "2025-08-15T12:00:00Z" })];
    expect(getPaymentRevenueForPeriod(payments, 7, 2026)).toBe(0);
  });

  it("returns zero for an empty payment list", () => {
    expect(getPaymentRevenueForPeriod([], 7, 2026)).toBe(0);
  });

  it("uses paymentDate, not createdAt, as the revenue date", () => {
    const payments = [
      makePayment({
        amount: 100,
        paymentDate: "2026-08-15T12:00:00Z",
        createdAt: "2026-09-01T12:00:00Z",
      }),
    ];
    expect(getPaymentRevenueForPeriod(payments, 7, 2026)).toBe(100);
    expect(getPaymentRevenueForPeriod(payments, 8, 2026)).toBe(0);
  });
});

describe("getPaymentRevenuePerVehicle", () => {
  it("maps payments to vehicles through their rental", () => {
    const payments = [
      makePayment({ id: "p1", rentalId: "r1", amount: 100, paymentDate: "2026-08-05T12:00:00Z" }),
      makePayment({ id: "p2", rentalId: "r2", amount: 50, paymentDate: "2026-08-06T12:00:00Z" }),
      makePayment({ id: "p3", rentalId: "r3", amount: 25, paymentDate: "2026-08-07T12:00:00Z" }),
    ];
    const rentals = [
      makeRental({ id: "r1", vehicleId: "v1" }),
      makeRental({ id: "r2", vehicleId: "v2" }),
      makeRental({ id: "r3", vehicleId: "v1" }),
    ];
    expect(getPaymentRevenuePerVehicle(payments, rentals, 7, 2026)).toEqual({
      v1: 125,
      v2: 50,
    });
  });

  it("ignores payments outside the period and payments with no matching rental", () => {
    const payments = [
      makePayment({ id: "p1", rentalId: "r1", amount: 100, paymentDate: "2026-09-01T12:00:00Z" }),
      makePayment({ id: "p2", rentalId: "missing", amount: 999, paymentDate: "2026-08-05T12:00:00Z" }),
    ];
    const rentals = [makeRental({ id: "r1", vehicleId: "v1" })];
    expect(getPaymentRevenuePerVehicle(payments, rentals, 7, 2026)).toEqual({});
  });
});

describe("getLifetimePaymentRevenuePerVehicle", () => {
  it("maps all recorded payments to their vehicles", () => {
    const payments = [
      makePayment({ rentalId: "r1", amount: 100 }),
      makePayment({ rentalId: "r2", amount: 50 }),
      makePayment({ rentalId: "missing", amount: 999 }),
    ];
    const rentals = [
      makeRental({ id: "r1", vehicleId: "v1" }),
      makeRental({ id: "r2", vehicleId: "v1" }),
    ];
    expect(getLifetimePaymentRevenuePerVehicle(payments, rentals)).toEqual({ v1: 150 });
  });

  it("returns no vehicles for empty data", () => {
    expect(getLifetimePaymentRevenuePerVehicle([], [])).toEqual({});
  });
});

describe("getTotalOutstanding", () => {
  it("sums the API-provided per-rental outstanding balances", () => {
    const balances = [
      { rentalId: "r1", customerId: "c1", outstandingBalance: 150 },
      { rentalId: "r2", customerId: "c1", outstandingBalance: 0 },
      { rentalId: "r3", customerId: "c2", outstandingBalance: 200.5 },
    ];
    expect(getTotalOutstanding(balances)).toBe(350.5);
  });

  it("returns zero when there are no balances", () => {
    expect(getTotalOutstanding([])).toBe(0);
  });
});

describe("getOutstandingPerCustomer", () => {
  it("groups positive balances by customer id", () => {
    const balances = [
      { rentalId: "r1", customerId: "c1", outstandingBalance: 150 },
      { rentalId: "r2", customerId: "c1", outstandingBalance: 50 },
      { rentalId: "r3", customerId: "c2", outstandingBalance: 75 },
    ];
    expect(getOutstandingPerCustomer(balances)).toEqual({ c1: 200, c2: 75 });
  });

  it("excludes zero and negative balances", () => {
    const balances = [
      { rentalId: "r1", customerId: "c1", outstandingBalance: 0 },
      { rentalId: "r2", customerId: "c1", outstandingBalance: -10 },
      { rentalId: "r3", customerId: "c1", outstandingBalance: 40 },
    ];
    expect(getOutstandingPerCustomer(balances)).toEqual({ c1: 40 });
  });
});
