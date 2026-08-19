import type {
  PaymentResponse,
  ExpenseResponse,
  MaintenanceResponse,
  RentalResponse,
  TaskResponse,
} from "@workspace/api-client-react";
import { getExpenseTotalPerVehicle } from "@/features/expenses/selectors";
import {
  getLifetimeMaintenanceCostPerVehicle,
  getMaintenanceCostPerVehicleForYear,
} from "@/features/maintenance/selectors";
import { getLifetimePaymentRevenuePerVehicle } from "@/features/payments/selectors";

// ─── Period helpers ────────────────────────────────────────────────────────────

export type ReportPeriodType = "month" | "quarter" | "year";

export interface ReportPeriodRange {
  /** Zero-based month of the first day of the period (0-11). */
  startMonth: number;
  /** Start year of the period. */
  startYear: number;
  /** Zero-based month of the day after the period's last day (0-11), so a
   * month period has endMonth === startMonth + 1 (mod 12) and the matching
   * endYear may roll into the next year. */
  endMonth: number;
  /** Year of the day after the period's last day. */
  endYear: number;
}

const MONTHS_PER_QUARTER = 3;

/**
 * Compute an inclusive period range for a given month, quarter, or year.
 * The range is expressed as `[startMonth/startYear, endMonth/endYear)` where the
 * end is exclusive. This lets a single predicate decide whether a date falls
 * within the period.
 */
export function getReportPeriodRange(
  type: ReportPeriodType,
  month: number,
  year: number,
): ReportPeriodRange {
  if (type === "year") {
    return {
      startMonth: 0,
      startYear: year,
      endMonth: 0,
      endYear: year + 1,
    };
  }

  if (type === "quarter") {
    const startMonth = Math.floor(month / MONTHS_PER_QUARTER) * MONTHS_PER_QUARTER;
    let endMonth = startMonth + MONTHS_PER_QUARTER;
    let endYear = year;
    if (endMonth >= 12) {
      endMonth -= 12;
      endYear += 1;
    }
    return { startMonth, startYear: year, endMonth, endYear };
  }

  // month
  let endMonth = month + 1;
  let endYear = year;
  if (endMonth >= 12) {
    endMonth = 0;
    endYear += 1;
  }
  return { startMonth: month, startYear: year, endMonth, endYear };
}

/** Whether an ISO date string falls within an inclusive period range. */
export function isDateInPeriod(
  dateStr: string,
  range: ReportPeriodRange,
): boolean {
  const ts = new Date(dateStr).getTime();

  // Use UTC-based boundaries so the comparison is timezone-independent. Input
  // dates are parsed from ISO strings (UTC), and period bounds are expressed as
  // calendar month boundaries.
  const start = Date.UTC(range.startYear, range.startMonth, 1);
  const end = Date.UTC(range.endYear, range.endMonth, 1);

  return ts >= start && ts < end;
}

// ─── Financial selectors (period-scoped, pure) ────────────────────────────────

/** Total revenue from recorded payments within a period, using `paymentDate`. */
export function getRevenueForPeriod(
  payments: PaymentResponse[],
  range: ReportPeriodRange,
): number {
  return payments.reduce(
    (sum, p) => (isDateInPeriod(p.paymentDate, range) ? sum + p.amount : sum),
    0,
  );
}

/** Total expenses within a period, using `expenseDate` and `Expense.amount`. */
export function getExpensesForPeriod(
  expenses: ExpenseResponse[],
  range: ReportPeriodRange,
): number {
  return expenses.reduce(
    (sum, e) => (isDateInPeriod(e.expenseDate, range) ? sum + e.amount : sum),
    0,
  );
}

/** Net profit for a period = recorded payment revenue − expenses. */
export function getNetProfitForPeriod(
  revenue: number,
  expenses: number,
): number {
  return revenue - expenses;
}

/** Total maintenance cost within a period, using `maintenanceDate` and `cost`. */
export function getMaintenanceCostForPeriod(
  records: MaintenanceResponse[],
  range: ReportPeriodRange,
): number {
  return records.reduce(
    (sum, m) =>
      isDateInPeriod(m.maintenanceDate, range) && m.cost != null
        ? sum + m.cost
        : sum,
    0,
  );
}

// ─── Count selectors (period-scoped, pure) ────────────────────────────────────

/** Number of rentals created (createdAt) within a period. */
export function getRentalsCountForPeriod(
  rentals: RentalResponse[],
  range: ReportPeriodRange,
): number {
  return rentals.reduce(
    (n, r) => (isDateInPeriod(r.createdAt, range) ? n + 1 : n),
    0,
  );
}

/** Number of maintenance records within a period. */
export function getMaintenanceCountForPeriod(
  records: MaintenanceResponse[],
  range: ReportPeriodRange,
): number {
  return records.reduce(
    (n, m) => (isDateInPeriod(m.maintenanceDate, range) ? n + 1 : n),
    0,
  );
}

/** Number of payments within a period. */
export function getPaymentsCountForPeriod(
  payments: PaymentResponse[],
  range: ReportPeriodRange,
): number {
  return payments.reduce(
    (n, p) => (isDateInPeriod(p.paymentDate, range) ? n + 1 : n),
    0,
  );
}

/** Number of completed tasks within a period, by dueDate and COMPLETED status. */
export function getCompletedTasksCountForPeriod(
  tasks: TaskResponse[],
  range: ReportPeriodRange,
): number {
  return tasks.reduce(
    (n, t) =>
      t.status === "COMPLETED" && isDateInPeriod(t.dueDate, range) ? n + 1 : n,
    0,
  );
}

// ─── Aggregate report snapshot ────────────────────────────────────────────────

export interface ReportSummary {
  revenue: number;
  expenses: number;
  netProfit: number;
  maintenanceCost: number;
  rentalCount: number;
  maintenanceCount: number;
  paymentCount: number;
  completedTaskCount: number;
}

/** Build a full financial/operational summary for a period from loaded data. */
export function buildReportSummary(
  range: ReportPeriodRange,
  data: {
    payments: PaymentResponse[];
    expenses: ExpenseResponse[];
    maintenance: MaintenanceResponse[];
    rentals: RentalResponse[];
    tasks: TaskResponse[];
  },
): ReportSummary {
  const revenue = getRevenueForPeriod(data.payments, range);
  const expenses = getExpensesForPeriod(data.expenses, range);
  return {
    revenue,
    expenses,
    netProfit: getNetProfitForPeriod(revenue, expenses),
    maintenanceCost: getMaintenanceCostForPeriod(data.maintenance, range),
    rentalCount: getRentalsCountForPeriod(data.rentals, range),
    maintenanceCount: getMaintenanceCountForPeriod(data.maintenance, range),
    paymentCount: getPaymentsCountForPeriod(data.payments, range),
    completedTaskCount: getCompletedTasksCountForPeriod(data.tasks, range),
  };
}

// ─── Analytics selectors ─────────────────────────────────────────────────────

export interface VehicleProfitability {
  vehicleId: string;
  revenue: number;
  expenses: number;
  maintenanceCost: number;
  totalCosts: number;
  profit: number;
}

/**
 * Build lifetime profitability per vehicle using recorded payments as revenue.
 * Maintenance remains a separate cost component and is not added to expenses.
 */
export function getVehicleProfitability(
  payments: PaymentResponse[],
  rentals: RentalResponse[],
  expenses: ExpenseResponse[],
  maintenance: MaintenanceResponse[],
): VehicleProfitability[] {
  const revenueByVehicle = getLifetimePaymentRevenuePerVehicle(payments, rentals);
  const expensesByVehicle = getExpenseTotalPerVehicle(expenses);
  const maintenanceByVehicle = getLifetimeMaintenanceCostPerVehicle(maintenance);
  const vehicleIds = new Set([
    ...Object.keys(revenueByVehicle),
    ...Object.keys(expensesByVehicle),
    ...Object.keys(maintenanceByVehicle),
  ]);

  return [...vehicleIds]
    .map((vehicleId) => {
      const revenue = revenueByVehicle[vehicleId] ?? 0;
      const vehicleExpenses = expensesByVehicle[vehicleId] ?? 0;
      const maintenanceCost = maintenanceByVehicle[vehicleId] ?? 0;
      const totalCosts = vehicleExpenses + maintenanceCost;
      return {
        vehicleId,
        revenue,
        expenses: vehicleExpenses,
        maintenanceCost,
        totalCosts,
        profit: revenue - totalCosts,
      };
    })
    .sort((a, b) => b.profit - a.profit || a.vehicleId.localeCompare(b.vehicleId));
}

export interface BusinessPerformancePoint {
  period: string;
  revenue: number;
  expenses: number;
  netProfit: number;
}

/** Build a January-to-December business performance series for a year. */
export function getBusinessPerformanceTrend(
  payments: PaymentResponse[],
  expenses: ExpenseResponse[],
  year: number,
): BusinessPerformancePoint[] {
  return Array.from({ length: 12 }, (_, month) => {
    const range = getReportPeriodRange("month", month, year);
    const revenue = getRevenueForPeriod(payments, range);
    const expenseTotal = getExpensesForPeriod(expenses, range);
    return {
      period: `${year}-${String(month + 1).padStart(2, "0")}`,
      revenue,
      expenses: expenseTotal,
      netProfit: getNetProfitForPeriod(revenue, expenseTotal),
    };
  });
}

/** Build yearly maintenance cost per vehicle for analytics consumers. */
export function getYearlyMaintenanceCostPerVehicle(
  records: MaintenanceResponse[],
  year: number,
): Record<string, number> {
  return getMaintenanceCostPerVehicleForYear(records, year);
}

// ─── Export formatting helpers (pure, no DOM) ─────────────────────────────────

/** Escape a value for safe CSV output. Wraps in quotes when it contains a comma,
 * quote, or newline, and doubles embedded double-quotes. */
export function csvCell(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Build a CSV string from an array of rows. The first row is treated as the
 * header. Each cell is CSV-escaped.
 */
export function toCsv(rows: Array<Array<string | number>>): string {
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

/** Build a minimal, self-contained printable HTML report table. */
export function toPrintableHtml(
  title: string,
  headers: string[],
  rows: Array<Array<string | number>>,
): string {
  const head = headers.map((h) => `<th>${h}</th>`).join("");
  const body = rows
    .map(
      (row) =>
        `<tr>${row.map((c) => `<td>${csvCell(c)}</td>`).join("")}</tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 20px; margin-bottom: 12px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: right; font-size: 14px; }
    th { background: #f0f0f0; font-weight: 600; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <table>
    <thead><tr>${head}</tr></thead>
    <tbody>${body}</tbody>
  </table>
</body>
</html>`;
}
