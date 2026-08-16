import type { ExpenseResponse } from "@workspace/api-client-react";

export type ExpenseDisplayFilter = "all" | ExpenseResponse["category"];

/** Total expense amount across all records. Uses `Expense.amount` only. */
export function getExpenseTotal(expenses: ExpenseResponse[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

/** Total expense amount for a given month/year, matching the revenue period convention. */
export function getExpenseTotalForPeriod(
  expenses: ExpenseResponse[],
  month: number,
  year: number,
): number {
  return expenses.reduce((sum, e) => {
    const d = new Date(e.expenseDate);
    return d.getMonth() === month && d.getFullYear() === year ? sum + e.amount : sum;
  }, 0);
}

/** Total expense amount per vehicle, keyed by vehicle id. Org-level expenses are excluded. */
export function getExpenseTotalPerVehicle(
  expenses: ExpenseResponse[],
): Record<string, number> {
  const byVehicle: Record<string, number> = {};
  for (const e of expenses) {
    if (!e.vehicleId) continue;
    byVehicle[e.vehicleId] = (byVehicle[e.vehicleId] ?? 0) + e.amount;
  }
  return byVehicle;
}

/**
 * Net profit = payments - expenses.
 * `paymentsTotal` follows the existing payment data source convention (the
 * revenue/payments figure used by the analytics), while `expensesTotal` is the
 * sum of `Expense.amount`.
 */
export function getNetProfit(paymentsTotal: number, expensesTotal: number): number {
  return paymentsTotal - expensesTotal;
}

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
