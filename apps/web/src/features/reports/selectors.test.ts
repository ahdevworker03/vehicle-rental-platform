import { describe, it, expect } from "vitest";
import type {
  PaymentResponse,
  ExpenseResponse,
  MaintenanceResponse,
  RentalResponse,
  TaskResponse,
} from "@workspace/api-client-react";
import {
  getReportPeriodRange,
  isDateInPeriod,
  getRevenueForPeriod,
  getExpensesForPeriod,
  getNetProfitForPeriod,
  getMaintenanceCostForPeriod,
  getRentalsCountForPeriod,
  getMaintenanceCountForPeriod,
  getPaymentsCountForPeriod,
  getCompletedTasksCountForPeriod,
  buildReportSummary,
  csvCell,
  toCsv,
  toPrintableHtml,
  getVehicleProfitability,
  getBusinessPerformanceTrend,
  getYearlyMaintenanceCostPerVehicle,
  type ReportPeriodRange,
} from "./selectors";

function payment(overrides: Partial<PaymentResponse>): PaymentResponse {
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

function expense(overrides: Partial<ExpenseResponse>): ExpenseResponse {
  return {
    id: `e-${Math.random()}`,
    vehicleId: null,
    expenseDate: "2026-08-10T09:00:00Z",
    amount: 30,
    category: "FUEL",
    createdAt: "2026-08-10T09:00:00Z",
    updatedAt: "2026-08-10T09:00:00Z",
    ...overrides,
  };
}

function maintenance(overrides: Partial<MaintenanceResponse>): MaintenanceResponse {
  return {
    id: `m-${Math.random()}`,
    vehicleId: "v1",
    type: "PREVENTIVE_SERVICE",
    status: "COMPLETED",
    maintenanceDate: "2026-08-05T09:00:00Z",
    cost: 100,
    createdAt: "2026-08-05T09:00:00Z",
    updatedAt: "2026-08-05T09:00:00Z",
    ...overrides,
  };
}

function rental(overrides: Partial<RentalResponse>): RentalResponse {
  return {
    id: `r-${Math.random()}`,
    customerId: "c1",
    vehicleId: "v1",
    pickupDate: "2026-08-01T09:00:00Z",
    expectedReturnDate: "2026-08-10T09:00:00Z",
    status: "ACTIVE",
    dailyRate: 50,
    totalAmount: 450,
    depositAmount: 100,
    createdAt: "2026-08-01T09:00:00Z",
    updatedAt: "2026-08-01T09:00:00Z",
    ...overrides,
  };
}

function task(overrides: Partial<TaskResponse>): TaskResponse {
  return {
    id: `t-${Math.random()}`,
    dueDate: "2026-08-20T12:00:00Z",
    status: "PENDING",
    notes: null,
    createdAt: "2026-08-01T12:00:00Z",
    updatedAt: "2026-08-01T12:00:00Z",
    ...overrides,
  };
}

// ─── Period helpers ───────────────────────────────────────────────────────────

describe("getReportPeriodRange", () => {
  it("produces an exclusive month range that rolls into the next year", () => {
    expect(getReportPeriodRange("month", 11, 2026)).toEqual({
      startMonth: 11,
      startYear: 2026,
      endMonth: 0,
      endYear: 2027,
    });
    expect(getReportPeriodRange("month", 0, 2026)).toEqual({
      startMonth: 0,
      startYear: 2026,
      endMonth: 1,
      endYear: 2026,
    });
  });

  it("produces a quarter range starting at the quarter's first month", () => {
    expect(getReportPeriodRange("quarter", 2, 2026)).toEqual({
      startMonth: 0,
      startYear: 2026,
      endMonth: 3,
      endYear: 2026,
    });
    // Q4 rolls into next year
    expect(getReportPeriodRange("quarter", 11, 2026)).toEqual({
      startMonth: 9,
      startYear: 2026,
      endMonth: 0,
      endYear: 2027,
    });
  });

  it("produces a full-year range", () => {
    expect(getReportPeriodRange("year", 5, 2026)).toEqual({
      startMonth: 0,
      startYear: 2026,
      endMonth: 0,
      endYear: 2027,
    });
  });
});

describe("isDateInPeriod", () => {
  const aug2026: ReportPeriodRange = getReportPeriodRange("month", 7, 2026);

  it("includes dates inside the period", () => {
    expect(isDateInPeriod("2026-08-01T00:00:00Z", aug2026)).toBe(true);
    expect(isDateInPeriod("2026-08-31T23:59:59Z", aug2026)).toBe(true);
  });

  it("excludes dates outside the period", () => {
    expect(isDateInPeriod("2026-07-31T23:59:59Z", aug2026)).toBe(false);
    expect(isDateInPeriod("2026-09-01T00:00:00Z", aug2026)).toBe(false);
  });
});

// ─── Financial selectors ──────────────────────────────────────────────────────

describe("getRevenueForPeriod", () => {
  it("sums payment amounts within the period using paymentDate", () => {
    const range = getReportPeriodRange("month", 7, 2026);
    const payments = [
      payment({ amount: 100, paymentDate: "2026-08-05T12:00:00Z" }),
      payment({ amount: 50.5, paymentDate: "2026-08-20T12:00:00Z" }),
      payment({ amount: 999, paymentDate: "2026-09-01T12:00:00Z" }),
    ];
    expect(getRevenueForPeriod(payments, range)).toBe(150.5);
  });

  it("returns zero for an empty list or no matching period", () => {
    const range = getReportPeriodRange("month", 7, 2026);
    expect(getRevenueForPeriod([], range)).toBe(0);
    expect(getRevenueForPeriod([payment({ paymentDate: "2026-09-01T12:00:00Z" })], range)).toBe(0);
  });
});

describe("getExpensesForPeriod", () => {
  it("sums expense amounts within the period using expenseDate", () => {
    const range = getReportPeriodRange("year", 0, 2026);
    const expenses = [
      expense({ amount: 10, expenseDate: "2026-01-10T09:00:00Z" }),
      expense({ amount: 20, expenseDate: "2026-12-20T09:00:00Z" }),
      expense({ amount: 999, expenseDate: "2025-12-31T09:00:00Z" }),
    ];
    expect(getExpensesForPeriod(expenses, range)).toBe(30);
  });
});

describe("getNetProfitForPeriod", () => {
  it("computes revenue minus expenses", () => {
    expect(getNetProfitForPeriod(500, 150)).toBe(350);
  });

  it("can be negative when expenses exceed revenue", () => {
    expect(getNetProfitForPeriod(100, 200)).toBe(-100);
  });
});

describe("getMaintenanceCostForPeriod", () => {
  it("sums finalized maintenance cost within the period", () => {
    const range = getReportPeriodRange("quarter", 7, 2026);
    const records = [
      maintenance({ cost: 100, maintenanceDate: "2026-08-05T09:00:00Z" }),
      maintenance({ cost: 50, maintenanceDate: "2026-09-20T09:00:00Z" }),
      maintenance({ cost: 999, maintenanceDate: "2026-10-01T09:00:00Z" }),
      maintenance({ cost: null, maintenanceDate: "2026-08-10T09:00:00Z" }),
    ];
    expect(getMaintenanceCostForPeriod(records, range)).toBe(150);
  });
});

// ─── Count selectors ──────────────────────────────────────────────────────────

describe("count selectors", () => {
  const range = getReportPeriodRange("month", 7, 2026);

  it("counts rentals by createdAt", () => {
    const rentals = [
      rental({ createdAt: "2026-08-01T09:00:00Z" }),
      rental({ createdAt: "2026-08-02T09:00:00Z" }),
      rental({ createdAt: "2026-09-01T09:00:00Z" }),
    ];
    expect(getRentalsCountForPeriod(rentals, range)).toBe(2);
  });

  it("counts maintenance records by maintenanceDate", () => {
    const records = [
      maintenance({ maintenanceDate: "2026-08-05T09:00:00Z" }),
      maintenance({ maintenanceDate: "2026-08-31T09:00:00Z" }),
      maintenance({ maintenanceDate: "2026-09-01T09:00:00Z" }),
    ];
    expect(getMaintenanceCountForPeriod(records, range)).toBe(2);
  });

  it("counts payments by paymentDate", () => {
    const payments = [
      payment({ paymentDate: "2026-08-05T12:00:00Z" }),
      payment({ paymentDate: "2026-08-06T12:00:00Z" }),
      payment({ paymentDate: "2026-07-31T12:00:00Z" }),
    ];
    expect(getPaymentsCountForPeriod(payments, range)).toBe(2);
  });

  it("counts only COMPLETED tasks by dueDate", () => {
    const tasks = [
      task({ status: "COMPLETED", dueDate: "2026-08-20T12:00:00Z" }),
      task({ status: "PENDING", dueDate: "2026-08-21T12:00:00Z" }),
      task({ status: "COMPLETED", dueDate: "2026-09-01T12:00:00Z" }),
    ];
    expect(getCompletedTasksCountForPeriod(tasks, range)).toBe(1);
  });
});

// ─── Aggregate summary ────────────────────────────────────────────────────────

describe("buildReportSummary", () => {
  it("produces a complete summary for a period", () => {
    const range = getReportPeriodRange("month", 7, 2026);
    const summary = buildReportSummary(range, {
      payments: [
        payment({ amount: 200, paymentDate: "2026-08-05T12:00:00Z" }),
        payment({ amount: 50, paymentDate: "2026-08-20T12:00:00Z" }),
      ],
      expenses: [
        expense({ amount: 80, expenseDate: "2026-08-10T09:00:00Z" }),
      ],
      maintenance: [maintenance({ cost: 100, maintenanceDate: "2026-08-05T09:00:00Z" })],
      rentals: [rental({ createdAt: "2026-08-01T09:00:00Z" })],
      tasks: [task({ status: "COMPLETED", dueDate: "2026-08-20T12:00:00Z" })],
    });

    expect(summary).toEqual({
      revenue: 250,
      expenses: 80,
      netProfit: 170,
      maintenanceCost: 100,
      rentalCount: 1,
      maintenanceCount: 1,
      paymentCount: 2,
      completedTaskCount: 1,
    });
  });

  it("handles an empty period with zero values", () => {
    const range = getReportPeriodRange("year", 0, 2027);
    const summary = buildReportSummary(range, {
      payments: [],
      expenses: [],
      maintenance: [],
      rentals: [],
      tasks: [],
    });
    expect(summary.netProfit).toBe(0);
    expect(summary.revenue).toBe(0);
    expect(summary.rentalCount).toBe(0);
  });
});

describe("analytics selectors", () => {
  it("ranks vehicle profitability using revenue, expenses, and maintenance separately", () => {
    const result = getVehicleProfitability(
      [payment({ rentalId: "r1", amount: 500 })],
      [rental({ id: "r1", vehicleId: "v1" })],
      [expense({ vehicleId: "v1", amount: 100 })],
      [maintenance({ vehicleId: "v1", cost: 50 })],
    );
    expect(result).toEqual([{
      vehicleId: "v1",
      revenue: 500,
      expenses: 100,
      maintenanceCost: 50,
      totalCosts: 150,
      profit: 350,
    }]);
  });

  it("handles zero-data and does not treat maintenance as an expense", () => {
    expect(getVehicleProfitability([], [], [], [])).toEqual([]);
    const result = getVehicleProfitability(
      [], [], [], [maintenance({ vehicleId: "v1", cost: 75 })],
    );
    expect(result[0]).toMatchObject({ vehicleId: "v1", expenses: 0, maintenanceCost: 75, profit: -75 });
  });

  it("produces a monthly trend with revenue, expenses, and net profit", () => {
    const trend = getBusinessPerformanceTrend(
      [payment({ amount: 200, paymentDate: "2026-08-05T12:00:00Z" })],
      [expense({ amount: 50, expenseDate: "2026-08-20T12:00:00Z" })],
      2026,
    );
    expect(trend).toHaveLength(12);
    expect(trend[7]).toEqual({ period: "2026-08", revenue: 200, expenses: 50, netProfit: 150 });
    expect(trend[6]).toEqual({ period: "2026-07", revenue: 0, expenses: 0, netProfit: 0 });
  });

  it("exposes yearly maintenance cost per vehicle", () => {
    expect(getYearlyMaintenanceCostPerVehicle([
      maintenance({ vehicleId: "v1", cost: 100, maintenanceDate: "2026-01-01T12:00:00Z" }),
      maintenance({ vehicleId: "v1", cost: 25, maintenanceDate: "2025-01-01T12:00:00Z" }),
    ], 2026)).toEqual({ v1: 100 });
  });
});

// ─── Export helpers ───────────────────────────────────────────────────────────

describe("csvCell", () => {
  it("leaves plain cells unquoted", () => {
    expect(csvCell("abc")).toBe("abc");
    expect(csvCell(123)).toBe("123");
  });

  it("quotes cells containing commas, quotes, or newlines", () => {
    expect(csvCell("a,b")).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell("line1\nline2")).toBe('"line1\nline2"');
  });
});

describe("toCsv", () => {
  it("joins rows with a header and escaped cells", () => {
    const csv = toCsv([
      ["الإيرادات", "المصروفات"],
      [100, "a,b"],
    ]);
    expect(csv).toBe('الإيرادات,المصروفات\n100,"a,b"');
  });
});

describe("toPrintableHtml", () => {
  it("produces a self-contained RTL HTML table", () => {
    const html = toPrintableHtml("تقرير", ["البند", "القيمة"], [["إيرادات", 100]]);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain('dir="rtl"');
    expect(html).toContain("<h1>تقرير</h1>");
    expect(html).toContain("<th>البند</th>");
    expect(html).toContain("<td>100</td>");
    expect(html).toContain("</html>");
  });
});
