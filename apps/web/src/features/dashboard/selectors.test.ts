import { describe, expect, it } from "vitest";
import type {
  ExpenseResponse,
  PaymentResponse,
  RentalResponse,
  VehicleResponse,
} from "@workspace/api-client-react";
import {
  deriveDashboardData,
  getCurrentDashboardPeriod,
  getDaysFromCurrentDay,
} from "./selectors";

const now = new Date("2026-08-29T12:00:00Z");

function rental(overrides: Partial<RentalResponse>): RentalResponse {
  return {
    id: "rental-1",
    customerId: "customer-1",
    vehicleId: "vehicle-1",
    pickupDate: "2026-08-01T09:00:00Z",
    expectedReturnDate: "2026-08-29T09:00:00Z",
    status: "ACTIVE",
    dailyRate: 100,
    totalAmount: 500,
    depositAmount: 100,
    createdAt: "2026-08-01T09:00:00Z",
    updatedAt: "2026-08-01T09:00:00Z",
    ...overrides,
  };
}

function vehicle(status: VehicleResponse["status"]): VehicleResponse {
  return {
    id: `vehicle-${status}`,
    make: "Toyota",
    model: "Yaris",
    plateNumber: "A-1",
    year: 2024,
    color: "White",
    transmission: "AUTOMATIC",
    fuelType: "PETROL",
    seats: 5,
    currentMileage: 0,
    status,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };
}

function payment(date: string, amount: number): PaymentResponse {
  return { id: date, rentalId: "rental-1", paymentDate: date, amount, method: "CASH", createdAt: date, updatedAt: date };
}

function expense(date: string, amount: number): ExpenseResponse {
  return { id: date, expenseDate: date, amount, category: "FUEL", createdAt: date, updatedAt: date };
}

describe("dashboard API-derived data", () => {
  it("uses UTC calendar-day boundaries for overdue, today, and upcoming returns", () => {
    expect(getDaysFromCurrentDay("2026-08-28T23:59:59Z", now)).toBe(-1);
    expect(getDaysFromCurrentDay("2026-08-29T00:00:00Z", now)).toBe(0);
    expect(getDaysFromCurrentDay("2026-08-31T23:59:59Z", now)).toBe(2);

    const dashboard = deriveDashboardData({
      vehicles: [],
      rentals: [
        rental({ id: "overdue", expectedReturnDate: "2026-08-28T09:00:00Z" }),
        rental({ id: "today", expectedReturnDate: "2026-08-29T09:00:00Z" }),
        rental({ id: "soon", expectedReturnDate: "2026-08-31T09:00:00Z" }),
        rental({ id: "later", expectedReturnDate: "2026-09-01T09:00:00Z" }),
      ],
      maintenance: [], expenses: [], payments: [], outstandingBalance: 0,
    }, now);

    expect(dashboard.overdueReturns.map((item) => item.id)).toEqual(["overdue"]);
    expect(dashboard.returningToday.map((item) => item.id)).toEqual(["today"]);
    expect(dashboard.endingSoonRentals.map((item) => item.id)).toEqual(["soon"]);
  });

  it("uses current-month API payment and expense dates for financial totals", () => {
    const dashboard = deriveDashboardData({
      vehicles: [vehicle("AVAILABLE"), vehicle("RENTED"), vehicle("MAINTENANCE")],
      rentals: [], maintenance: [], outstandingBalance: 75,
      payments: [payment("2026-08-05T00:00:00Z", 300), payment("2026-07-31T00:00:00Z", 50)],
      expenses: [expense("2026-08-12T00:00:00Z", 100), expense("2026-09-01T00:00:00Z", 40)],
    }, now);

    expect(dashboard.revenue).toBe(300);
    expect(dashboard.expenses).toBe(100);
    expect(dashboard.netProfit).toBe(200);
    expect(dashboard.pendingBalance).toBe(75);
    expect(dashboard.availableCount).toBe(1);
  });

  it("rolls the explicit finance period into the previous year in January", () => {
    const period = getCurrentDashboardPeriod(new Date("2026-01-04T12:00:00Z"));

    expect(period.range).toMatchObject({ startMonth: 0, startYear: 2026 });
    expect(period.previousRange).toMatchObject({ startMonth: 11, startYear: 2025 });
  });
});
