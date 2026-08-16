import { describe, it, expect } from "vitest";
import type { ExpenseResponse } from "@workspace/api-client-react";
import {
  matchesCategoryFilter,
  filterExpenses,
  getExpenseTotal,
  getExpenseTotalForPeriod,
  getExpenseTotalPerVehicle,
  getNetProfit,
} from "./selectors";

function makeExpense(overrides: Partial<ExpenseResponse>): ExpenseResponse {
  return {
    id: `e-${Math.random()}`,
    vehicleId: null,
    expenseDate: "2026-08-20T09:00:00Z",
    amount: 50,
    category: "FUEL",
    createdAt: "2026-08-01T09:00:00Z",
    updatedAt: "2026-08-01T09:00:00Z",
    ...overrides,
  };
}

const categoryLabel = (category: ExpenseResponse["category"]) =>
  ({ FUEL: "وقود", INSURANCE: "تأمين", REGISTRATION: "تسجيل", CLEANING: "تنظيف", OTHER: "أخرى" })[category];
const vehicleName = (e: ExpenseResponse) => (e.vehicleId ? `Toyota Corolla` : "");

describe("matchesCategoryFilter", () => {
  it("matches the persisted category", () => {
    expect(matchesCategoryFilter(makeExpense({ category: "FUEL" }), "FUEL")).toBe(true);
    expect(matchesCategoryFilter(makeExpense({ category: "FUEL" }), "INSURANCE")).toBe(false);
  });

  it("always matches the all filter", () => {
    expect(matchesCategoryFilter(makeExpense({ category: "CLEANING" }), "all")).toBe(true);
  });
});

describe("filterExpenses", () => {
  it("filters by category", () => {
    const expenses = [
      makeExpense({ category: "FUEL" }),
      makeExpense({ category: "INSURANCE" }),
    ];
    const result = filterExpenses(expenses, "FUEL", "", vehicleName, categoryLabel);
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("FUEL");
  });

  it("filters by search term over the vehicle name", () => {
    const expenses = [
      makeExpense({ category: "FUEL", vehicleId: "v1" }),
      makeExpense({ category: "FUEL", vehicleId: null }),
    ];
    const result = filterExpenses(expenses, "all", "corolla", vehicleName, categoryLabel);
    expect(result).toHaveLength(1);
    expect(result[0].vehicleId).toBe("v1");
  });

  it("filters by search term over the description", () => {
    const expenses = [
      makeExpense({ category: "FUEL", description: "وقود للرحلة" }),
      makeExpense({ category: "FUEL", description: "زيت" }),
    ];
    const result = filterExpenses(expenses, "all", "رحلة", vehicleName, categoryLabel);
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe("وقود للرحلة");
  });

  it("filters by search term over the category label", () => {
    const expenses = [
      makeExpense({ category: "FUEL" }),
      makeExpense({ category: "CLEANING" }),
    ];
    const result = filterExpenses(expenses, "all", "وقود", vehicleName, categoryLabel);
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("FUEL");
  });

  it("returns everything for an empty search and all filter", () => {
    const expenses = [
      makeExpense({ category: "FUEL" }),
      makeExpense({ category: "OTHER" }),
    ];
    expect(filterExpenses(expenses, "all", "", vehicleName, categoryLabel)).toHaveLength(2);
  });
});

describe("getExpenseTotal", () => {
  it("sums the amount of all expenses", () => {
    const expenses = [
      makeExpense({ amount: 50 }),
      makeExpense({ amount: 100.5 }),
      makeExpense({ amount: 0 }),
    ];
    expect(getExpenseTotal(expenses)).toBe(150.5);
  });

  it("returns zero for an empty list", () => {
    expect(getExpenseTotal([])).toBe(0);
  });
});

describe("getExpenseTotalForPeriod", () => {
  it("sums expenses for the given month/year only", () => {
    const expenses = [
      makeExpense({ expenseDate: "2025-01-10T09:00:00Z", amount: 50 }),
      makeExpense({ expenseDate: "2025-01-20T09:00:00Z", amount: 25 }),
      makeExpense({ expenseDate: "2025-02-01T09:00:00Z", amount: 999 }),
      makeExpense({ expenseDate: "2024-01-15T09:00:00Z", amount: 999 }),
    ];
    expect(getExpenseTotalForPeriod(expenses, 0, 2025)).toBe(75);
  });

  it("returns zero when nothing falls in the period", () => {
    expect(getExpenseTotalForPeriod([makeExpense({ expenseDate: "2025-02-01T09:00:00Z" })], 0, 2025)).toBe(0);
  });
});

describe("getExpenseTotalPerVehicle", () => {
  it("sums amount per vehicle, excluding org-level expenses", () => {
    const expenses = [
      makeExpense({ vehicleId: "v1", amount: 50 }),
      makeExpense({ vehicleId: "v1", amount: 25 }),
      makeExpense({ vehicleId: "v2", amount: 10 }),
      makeExpense({ vehicleId: null, amount: 999 }),
    ];
    expect(getExpenseTotalPerVehicle(expenses)).toEqual({ v1: 75, v2: 10 });
  });

  it("returns an empty map for an empty list", () => {
    expect(getExpenseTotalPerVehicle([])).toEqual({});
  });
});

describe("getNetProfit", () => {
  it("computes payments minus expenses", () => {
    expect(getNetProfit(500, 150)).toBe(350);
  });

  it("can be negative when expenses exceed payments", () => {
    expect(getNetProfit(100, 200)).toBe(-100);
  });
});
