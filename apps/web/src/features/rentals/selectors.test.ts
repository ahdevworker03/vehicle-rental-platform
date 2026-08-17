import { describe, it, expect } from "vitest";
import type { Rental } from "@/data/types";
import {
  getTotalPaid,
  getRemaining,
  getActiveRentals,
} from "./selectors";

function makeRental(overrides: Partial<Rental>): Rental {
  return {
    id: "r-x",
    vehicleIds: ["v1"],
    customerId: "c1",
    startDate: "2025-01-01T12:00:00.000Z",
    endDate: "2025-01-10T12:00:00.000Z",
    dailyPrices: { v1: 50 },
    payments: [],
    totalAmount: 0,
    status: "active",
    ...overrides,
  };
}

describe("getTotalPaid", () => {
  it("sums all payments", () => {
    const rental = makeRental({
      payments: [
        { id: "p1", amount: 100, date: "2025-01-02T12:00:00.000Z" },
        { id: "p2", amount: 250, date: "2025-01-03T12:00:00.000Z" },
      ],
    });
    expect(getTotalPaid(rental)).toBe(350);
  });

  it("returns 0 when there are no payments", () => {
    expect(getTotalPaid(makeRental({ payments: [] }))).toBe(0);
  });
});

describe("getRemaining", () => {
  it("returns total minus paid", () => {
    const rental = makeRental({
      totalAmount: 500,
      payments: [{ id: "p1", amount: 200, date: "2025-01-02T12:00:00.000Z" }],
    });
    expect(getRemaining(rental)).toBe(300);
  });

  it("never goes below zero when overpaid", () => {
    const rental = makeRental({
      totalAmount: 100,
      payments: [{ id: "p1", amount: 150, date: "2025-01-02T12:00:00.000Z" }],
    });
    expect(getRemaining(rental)).toBe(0);
  });
});

describe("getActiveRentals", () => {
  it("returns only rentals with active status", () => {
    const rentals = [
      makeRental({ id: "r1", status: "active" }),
      makeRental({ id: "r2", status: "ended" }),
    ];
    expect(getActiveRentals(rentals).map((r) => r.id)).toEqual(["r1"]);
  });
});
