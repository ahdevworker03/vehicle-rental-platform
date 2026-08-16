import type { ExpenseResponse } from "@workspace/api-client-react";

export type ExpenseDisplayFilter = "all" | ExpenseResponse["category"];

/** Match a single expense against a persisted category filter. */
export function matchesCategoryFilter(
  expense: ExpenseResponse,
  filter: ExpenseDisplayFilter,
): boolean {
  if (filter === "all") return true;
  return expense.category === filter;
}

/**
 * Filter expenses by category, then by a free-text search term
 * over the vehicle name, category label, or description.
 */
export function filterExpenses(
  expenses: ExpenseResponse[],
  filter: ExpenseDisplayFilter,
  search: string,
  getVehicleName: (expense: ExpenseResponse) => string,
  getCategoryLabel: (category: ExpenseResponse["category"]) => string,
): ExpenseResponse[] {
  const q = search.trim().toLowerCase();

  return expenses
    .filter((e) => matchesCategoryFilter(e, filter))
    .filter((e) => {
      if (!q) return true;
      const vehicleName = getVehicleName(e).toLowerCase();
      const categoryLabel = getCategoryLabel(e.category).toLowerCase();
      const description = (e.description ?? "").toLowerCase();
      return (
        vehicleName.includes(q) ||
        categoryLabel.includes(q) ||
        description.includes(q)
      );
    });
}
