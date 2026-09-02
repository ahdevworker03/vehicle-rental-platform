import type {
  ExpenseResponse,
  MaintenanceResponse,
  PaymentResponse,
  RentalResponse,
  VehicleResponse,
} from "@workspace/api-client-react";
import {
  getExpensesForPeriod,
  getNetProfitForPeriod,
  getReportPeriodRange,
  getRevenueForPeriod,
  type ReportPeriodRange,
} from "@/features/reports/selectors";
import { formatMonthYear } from "@/lib/format";

export interface DashboardPeriod {
  label: string;
  range: ReportPeriodRange;
  previousRange: ReportPeriodRange;
}

function toUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function getDaysFromCurrentDay(date: string, now: Date): number {
  return Math.round((toUtcDay(new Date(date)) - toUtcDay(now)) / 86_400_000);
}

export function getCurrentDashboardPeriod(now: Date): DashboardPeriod {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const previousDate = new Date(Date.UTC(year, month - 1, 1));

  return {
    label: formatMonthYear(month, year),
    range: getReportPeriodRange("month", month, year),
    previousRange: getReportPeriodRange(
      "month",
      previousDate.getUTCMonth(),
      previousDate.getUTCFullYear(),
    ),
  };
}

export function deriveDashboardData(
  data: {
    vehicles: VehicleResponse[];
    rentals: RentalResponse[];
    maintenance: MaintenanceResponse[];
    expenses: ExpenseResponse[];
    payments: PaymentResponse[];
    outstandingBalance: number | null;
  },
  now: Date,
) {
  const activeRentals = data.rentals.filter((rental) => rental.status === "ACTIVE");
  const rentalsWithDays = activeRentals.map((rental) => ({
    rental,
    days: getDaysFromCurrentDay(rental.expectedReturnDate, now),
  }));
  const byExpectedReturn = (a: { rental: RentalResponse }, b: { rental: RentalResponse }) =>
    new Date(a.rental.expectedReturnDate).getTime() -
    new Date(b.rental.expectedReturnDate).getTime();
  const overdueReturns = rentalsWithDays.filter((item) => item.days < 0).sort(byExpectedReturn).map((item) => item.rental);
  const returningToday = rentalsWithDays.filter((item) => item.days === 0).sort(byExpectedReturn).map((item) => item.rental);
  const endingSoonRentals = rentalsWithDays.filter((item) => item.days > 0 && item.days <= 2).sort(byExpectedReturn).map((item) => item.rental);
  const overdueMaintenance = data.maintenance
    .filter((record) => record.status !== "COMPLETED")
    .filter((record) => getDaysFromCurrentDay(record.maintenanceDate, now) < 0)
    .sort((a, b) => new Date(a.maintenanceDate).getTime() - new Date(b.maintenanceDate).getTime());
  const upcomingMaintenance = data.maintenance
    .filter((record) => record.status !== "COMPLETED")
    .filter((record) => {
      const days = getDaysFromCurrentDay(record.maintenanceDate, now);
      return days >= 0 && days <= 7;
    })
    .sort((a, b) => new Date(a.maintenanceDate).getTime() - new Date(b.maintenanceDate).getTime());
  const period = getCurrentDashboardPeriod(now);
  const revenue = getRevenueForPeriod(data.payments, period.range);
  const expenses = getExpensesForPeriod(data.expenses, period.range);
  const previousRevenue = getRevenueForPeriod(data.payments, period.previousRange);
  const previousExpenses = getExpensesForPeriod(data.expenses, period.previousRange);

  return {
    activeRentals,
    availableCount: data.vehicles.filter((vehicle) => vehicle.status === "AVAILABLE").length,
    rentedCount: data.vehicles.filter((vehicle) => vehicle.status === "RENTED").length,
    vehiclesUnderMaintenance: data.vehicles.filter((vehicle) => vehicle.status === "MAINTENANCE").length,
    outOfServiceCount: data.vehicles.filter((vehicle) => vehicle.status === "OUT_OF_SERVICE").length,
    maintenanceCount: data.maintenance.length,
    revenue,
    expenses,
    netProfit: getNetProfitForPeriod(revenue, expenses),
    previousNetProfit: getNetProfitForPeriod(previousRevenue, previousExpenses),
    pendingBalance: data.outstandingBalance,
    period,
    overdueReturns,
    returningToday,
    endingSoonRentals,
    priorityReturns: [...overdueReturns, ...returningToday, ...endingSoonRentals].slice(0, 4),
    overdueMaintenance,
    upcomingMaintenance,
    recentActivity: data.rentals
      .filter((rental) => rental.status === "RETURNED" && rental.actualReturnDate)
      .sort((a, b) => new Date(b.actualReturnDate!).getTime() - new Date(a.actualReturnDate!).getTime())
      .slice(0, 4),
  };
}
