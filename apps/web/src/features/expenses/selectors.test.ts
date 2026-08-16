import { describe, it, expect } from "vitest";
import type { ExpenseResponse } from "@workspace/api-client-react";
import { matchesCategoryFilter, filterExpenses } from "./selectors";

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
