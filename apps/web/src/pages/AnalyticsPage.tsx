import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

import { formatCurrency } from "@/lib/format";
import { VEHICLE_STATUS_LABELS } from "@/lib/labels";

import { useVehicles } from "@/features/vehicles/hooks";
import { useRentals } from "@/features/rentals/hooks";
import { useCustomers, useCustomerById } from "@/features/customers/hooks";
import {
  getVehicleStatusCounts,
  getVehiclesByStatus,
} from "@/features/vehicles/selectors";
import {
  getActiveRentals,
  getEndedRentals,
} from "@/features/rentals/selectors";
import { useMaintenance } from "@/features/maintenance/hooks";
import { getMaintenanceCostPerVehicle } from "@/features/maintenance/selectors";
import { useExpenses } from "@/features/expenses/hooks";
import {
  getExpenseTotal,
  getExpenseTotalForPeriod,
  getExpenseTotalPerVehicle,
  getNetProfit,
} from "@/features/expenses/selectors";
import { usePayments, useOrgOutstandingBalances } from "@/features/payments/hooks";
import {
  getPaymentRevenueForPeriod,
  getPaymentRevenuePerVehicle,
  getOutstandingPerCustomer,
  getTotalOutstanding,
  type RentalOutstandingBalance,
} from "@/features/payments/selectors";
import {
  getBusinessPerformanceTrend,
  getVehicleProfitability,
  getYearlyMaintenanceCostPerVehicle,
} from "@/features/reports/selectors";
import { useListVehicles, useListCustomers } from "@workspace/api-client-react";
import { getApiErrorMessage } from "@/lib/api-error";
import type { MaintenanceResponse, ExpenseResponse, RentalResponse } from "@workspace/api-client-react";

// ─── Mock date anchor ─────────────────────────────────────────────────────────
const MOCK_MONTH = 0;   // January
const MOCK_YEAR  = 2025;
const PREV_MONTH = 11;  // December
const PREV_YEAR  = 2024;
const ANALYTICS_YEARS = [2026, 2025, 2024];

// ─── Derived data (computed per render from the feature hooks) ──────────────────
function deriveAnalytics(
  vehicles: ReturnType<typeof useVehicles>,
  rentals: ReturnType<typeof useRentals>,
  customers: ReturnType<typeof useCustomers>,
  getCustomerById: (id: string) => import("@/data/types").Customer | undefined,
  maintenance: MaintenanceResponse[],
  realVehicles: Array<{ id: string; make: string; model: string }>,
  expenses: ExpenseResponse[],
  payments: ReturnType<typeof usePayments>["payments"],
  apiRentals: RentalResponse[],
  outstandingBalances: RentalOutstandingBalance[],
  realCustomersById: Map<string, { id: string; name: string; location: string }>,
  selectedYear: number,
) {
  const thisMonthRevenue = getPaymentRevenueForPeriod(payments, MOCK_MONTH, selectedYear);
  const prevMonthRevenue = getPaymentRevenueForPeriod(payments, PREV_MONTH, selectedYear - 1);
  const vehicleRevenueThisMonth = getPaymentRevenuePerVehicle(payments, apiRentals, MOCK_MONTH, selectedYear);

  const revenueChange =
    prevMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
      : null;
  const revenueUp = revenueChange !== null && revenueChange >= 0;

  const totalPending = getTotalOutstanding(outstandingBalances);
  const activeRentals = getActiveRentals(rentals);

  const vehicleRevenueList = Object.entries(vehicleRevenueThisMonth)
    .map(([vid, amount]) => ({ vehicle: realVehicles.find((v) => v.id === vid)!, amount }))
    .filter((x) => x.vehicle && x.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const maxVehicleRevenue = vehicleRevenueList[0]?.amount ?? 1;

  const {
    available: availableCount,
    rented: rentedCount,
    maintenance: maintenanceCount,
  } = getVehicleStatusCounts(vehicles);

  const rentedVehicles      = getVehiclesByStatus(vehicles, "rented");
  const maintenanceVehicles = getVehiclesByStatus(vehicles, "maintenance");

  const endedCount = getEndedRentals(rentals).length;

  const customerBalance = getOutstandingPerCustomer(outstandingBalances);
  const topDebtorEntry = Object.entries(customerBalance).sort((a, b) => b[1] - a[1])[0];
  const topDebtor = topDebtorEntry
    ? (() => {
        const customer = realCustomersById.get(topDebtorEntry[0]);
        return customer ? { customer, balance: topDebtorEntry[1] } : null;
      })()
    : null;

  const maintenanceCostPerVehicle = getMaintenanceCostPerVehicle(maintenance);
  const maintenanceCostList = Object.entries(maintenanceCostPerVehicle)
    .map(([vid, cost]) => ({
      vehicle: realVehicles.find((v) => v.id === vid),
      cost,
    }))
    .filter((x) => x.vehicle && x.cost > 0)
    .sort((a, b) => b.cost - a.cost);

  const totalExpenses = getExpenseTotal(expenses);
  const expenseTotalForPeriod = getExpenseTotalForPeriod(expenses, MOCK_MONTH, selectedYear);
  const expensePerVehicle = getExpenseTotalPerVehicle(expenses);
  const expensePerVehicleList = Object.entries(expensePerVehicle)
    .map(([vid, amount]) => ({
      vehicle: realVehicles.find((v) => v.id === vid),
      amount,
    }))
    .filter((x) => x.vehicle && x.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Net profit = recorded payment revenue - expenses for the period.
  const netProfit = getNetProfit(thisMonthRevenue, expenseTotalForPeriod);
  const performanceTrend = getBusinessPerformanceTrend(payments, expenses, selectedYear);
  const yearlyMaintenanceCost = getYearlyMaintenanceCostPerVehicle(maintenance, selectedYear);
  const profitability = getVehicleProfitability(payments, apiRentals, expenses, maintenance);

  return {
    thisMonthRevenue,
    prevMonthRevenue,
    revenueChange,
    revenueUp,
    totalPending,
    activeRentals,
    vehicleRevenueList,
    maxVehicleRevenue,
    availableCount,
    rentedCount,
    maintenanceCount,
    rentedVehicles,
    maintenanceVehicles,
    maintenanceCostList,
    lifetimeMaintenanceCost: maintenanceCostPerVehicle,
    totalExpenses,
    expensePerVehicleList,
    netProfit,
    endedCount,
    topDebtor,
    performanceTrend,
    yearlyMaintenanceCost,
    profitability,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [, navigate] = useLocation();
  const [selectedYear, setSelectedYear] = useState(MOCK_YEAR);
  const vehicles = useVehicles();
  const rentals = useRentals();
  const customers = useCustomers();
  const getCustomerById = useCustomerById();
  const maintenanceQuery = useMaintenance();
  const maintenance = maintenanceQuery.data?.data ?? [];
  const realVehiclesQuery = useListVehicles();
  const { data: realVehiclesData } = realVehiclesQuery;
  const realVehicles = realVehiclesData?.data ?? [];
  const expensesQuery = useExpenses();
  const expenses = expensesQuery.data?.data ?? [];
  const paymentsQuery = usePayments();
  const payments = paymentsQuery.payments;
  const outstandingQuery = useOrgOutstandingBalances();
  const apiRentals = outstandingQuery.rentals;
  const outstandingBalances = outstandingQuery.balances;
  const { data: realCustomersData } = useListCustomers();
  const realCustomers = realCustomersData?.data ?? [];

  const realCustomersById = useMemo(
    () =>
      new Map(
        realCustomers.map((c) => [
          c.id,
          {
            id: c.id,
            name: `${c.firstName} ${c.lastName}`.trim(),
            location: c.address,
          },
        ]),
      ),
    [realCustomers],
  );

  const {
    thisMonthRevenue,
    prevMonthRevenue,
    revenueChange,
    revenueUp,
    totalPending,
    activeRentals,
    vehicleRevenueList,
    maxVehicleRevenue,
    availableCount,
    rentedCount,
    maintenanceCount,
    rentedVehicles,
    maintenanceVehicles,
    maintenanceCostList,
    totalExpenses,
    expensePerVehicleList,
    netProfit,
    endedCount,
    topDebtor,
    performanceTrend,
    yearlyMaintenanceCost,
    profitability,
    lifetimeMaintenanceCost,
  } = deriveAnalytics(
    vehicles,
    rentals,
    customers,
    getCustomerById,
    maintenance,
    realVehicles,
    expenses,
    payments,
    apiRentals,
    outstandingBalances,
    realCustomersById,
    selectedYear,
  );

  const financialLoading =
    paymentsQuery.isLoading ||
    expensesQuery.isLoading ||
    outstandingQuery.isLoading;
  const financialError = getApiErrorMessage(
    paymentsQuery.error ??
      expensesQuery.error ??
      outstandingQuery.error,
  ).title;
  const hasFinancialError = Boolean(
    paymentsQuery.error || expensesQuery.error || outstandingQuery.error,
  );
  const analyticsLoading =
    maintenanceQuery.isLoading || realVehiclesQuery.isLoading || financialLoading;
  const analyticsError = getApiErrorMessage(
    maintenanceQuery.error ??
      realVehiclesQuery.error ??
      paymentsQuery.error ??
      expensesQuery.error ??
      outstandingQuery.error,
  ).title;
  const hasAnalyticsError = Boolean(
    maintenanceQuery.error ||
      realVehiclesQuery.error ||
      paymentsQuery.error ||
      expensesQuery.error ||
      outstandingQuery.error,
  );
  const outstandingLoading = outstandingQuery.isLoading;
  const hasOutstandingError = Boolean(outstandingQuery.error);
  const outstandingError = getApiErrorMessage(outstandingQuery.error).title;

  return (
    <div className="min-h-full">
      <PageHeader title="التحليلات" showBack />

      <div className="px-4 pt-4 pb-8 space-y-6">

        {/* ── Top row: Revenue + Revenue by vehicle ─────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">

        {/* ── Section 1: Revenue ─────────────────────────────────────────── */}
        <section>
          <SectionHeader
            title="الإيرادات"
            action={
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="sr-only">سنة التحليل</span>
                <select
                  aria-label="سنة التحليل"
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(Number(event.target.value))}
                  className="rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-foreground"
                >
                  {ANALYTICS_YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </label>
            }
          />

          {/* Main revenue card */}
          <div className="rounded-2xl bg-primary p-5 text-white mb-3">
              <p className="text-sm font-medium opacity-80 mb-1">إيرادات كانون الثاني {selectedYear}</p>
            {financialLoading ? (
              <p className="text-sm font-medium opacity-90 py-2">جارٍ التحميل...</p>
            ) : hasFinancialError ? (
              <p className="text-sm font-medium opacity-90 py-2">{financialError}</p>
            ) : (
              <p className="text-3xl font-bold tracking-tight">{formatCurrency(thisMonthRevenue)}</p>
            )}

            {!financialLoading && !hasFinancialError && revenueChange !== null && (
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/20">
                {revenueUp
                  ? <TrendingUp size={15} className="shrink-0 opacity-90" />
                  : <TrendingDown size={15} className="shrink-0 opacity-90" />}
                <span className="text-sm opacity-90">
                  {revenueUp ? "+" : ""}{revenueChange}٪ مقارنةً بالشهر الماضي
                  {" "}({formatCurrency(prevMonthRevenue)})
                </span>
              </div>
            )}
          </div>

          {/* Pending balance warning */}
          <div className="rounded-xl border border-[hsl(var(--status-danger-bg))] bg-[hsl(var(--status-danger-bg))] px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[hsl(var(--status-danger))]">
              <AlertCircle size={16} className="shrink-0" />
              <span className="text-sm font-medium">مبالغ غير محصّلة</span>
            </div>
            {outstandingLoading ? (
              <span className="text-sm font-bold text-[hsl(var(--status-danger))]">جارٍ التحميل...</span>
            ) : hasOutstandingError ? (
              <span className="text-sm font-bold text-[hsl(var(--status-danger))]">{outstandingError}</span>
            ) : (
              <span className="text-sm font-bold text-[hsl(var(--status-danger))]">
                {formatCurrency(totalPending)}
              </span>
            )}
          </div>
        </section>

        {/* ── Section 2: Revenue by vehicle ─────────────────────────────── */}
        <section>
          <SectionHeader title="إيرادات السيارات هذا الشهر" />

          {financialLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">جارٍ التحميل...</p>
          ) : hasFinancialError ? (
            <p className="text-sm text-muted-foreground text-center py-4">{financialError}</p>
          ) : vehicleRevenueList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              لا توجد إيرادات هذا الشهر
            </p>
          ) : (
            <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
              {vehicleRevenueList.map((item, idx) => {
                const pct = Math.round((item.amount / maxVehicleRevenue) * 100);
                const isTop = idx === 0;
                return (
                  <button
                    key={item.vehicle.id}
                    onClick={() => navigate(`/vehicles/${item.vehicle.id}`)}
                    className="w-full text-right px-4 py-3 hover:bg-muted/40 active:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-foreground tabular-nums">
                        {formatCurrency(item.amount)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isTop && (
                          <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full leading-none">
                            الأعلى
                          </span>
                        )}
                        <span className="text-sm font-medium text-foreground">
                          {item.vehicle.make} {item.vehicle.model}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isTop ? "bg-primary" : "bg-primary/40"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        </div>

        {/* ── Business performance trend ───────────────────────────────── */}
        <section>
          <SectionHeader title={`اتجاه أداء الأعمال ${selectedYear}`} />
          {analyticsLoading ? (
            <p className="rounded-2xl border border-border bg-card p-5 text-center text-sm text-muted-foreground" role="status">
              جارٍ تحميل اتجاه الأداء...
            </p>
          ) : hasAnalyticsError ? (
            <p className="rounded-2xl border border-border bg-card p-5 text-center text-sm text-destructive" role="alert">
              {analyticsError}
            </p>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted-foreground" aria-label="مفتاح اتجاه الأداء">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" /> الإيرادات</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--status-danger))]" aria-hidden="true" /> المصروفات</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--status-available))]" aria-hidden="true" /> صافي الربح</span>
              </div>
              {performanceTrend.every((point) => point.revenue === 0 && point.expenses === 0) ? (
                <p className="py-5 text-center text-sm text-muted-foreground">لا توجد بيانات أداء لهذه السنة</p>
              ) : (
                <div className="grid grid-cols-6 gap-2 sm:grid-cols-12" role="list" aria-label={`الأداء الشهري لعام ${selectedYear}`}>
                  {performanceTrend.map((point) => {
                    const maxValue = Math.max(point.revenue, point.expenses, Math.abs(point.netProfit), 1);
                    return (
                      <div key={point.period} className="min-w-0 text-center" role="listitem">
                        <div className="flex h-28 items-end justify-center gap-0.5 rounded-lg bg-muted/40 px-1 py-2" aria-label={`${point.period}: إيرادات ${formatCurrency(point.revenue)}، مصروفات ${formatCurrency(point.expenses)}، صافي ${formatCurrency(point.netProfit)}`}>
                          <span className="w-1.5 rounded-t bg-primary" style={{ height: `${Math.max((point.revenue / maxValue) * 100, point.revenue ? 4 : 0)}%` }} />
                          <span className="w-1.5 rounded-t bg-[hsl(var(--status-danger))]" style={{ height: `${Math.max((point.expenses / maxValue) * 100, point.expenses ? 4 : 0)}%` }} />
                          <span className={`w-1.5 rounded-t ${point.netProfit < 0 ? "bg-[hsl(var(--status-danger))]" : "bg-[hsl(var(--status-available))]"}`} style={{ height: `${Math.max((Math.abs(point.netProfit) / maxValue) * 100, point.netProfit ? 4 : 0)}%` }} />
                        </div>
                        <span className="mt-1 block text-[10px] text-muted-foreground">{point.period.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Maintenance cost per vehicle ──────────────────────────────── */}
        <section>
          <SectionHeader
            title="تكلفة الصيانة لكل سيارة"
            action={
              <button onClick={() => navigate("/maintenance")} className="flex items-center gap-1">
                عرض الكل
                <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            }
          />

          {maintenanceCostList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              لا توجد تكاليف صيانة مسجّلة
            </p>
          ) : (
            <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
              {maintenanceCostList.map((item) => (
                <button
                  key={item.vehicle!.id}
                  onClick={() => navigate(`/vehicles/${item.vehicle!.id}`)}
                  className="w-full text-right px-4 py-3 flex items-center justify-between hover:bg-muted/40 active:bg-muted transition-colors"
                >
                  <span className="text-sm font-semibold text-foreground">
                    {item.vehicle!.make} {item.vehicle!.model}
                  </span>
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    {formatCurrency(item.cost)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Expenses ──────────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            title="المصروفات"
            action={
              <button onClick={() => navigate("/expenses")} className="flex items-center gap-1">
                عرض الكل
                <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            }
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-3">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-foreground leading-tight mt-1 tabular-nums">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">صافي الربح</p>
              {financialLoading ? (
                <p className="text-lg font-semibold text-foreground leading-tight mt-1">
                  جارٍ التحميل...
                </p>
              ) : hasFinancialError ? (
                <p className="text-sm font-semibold text-destructive leading-tight mt-1">
                  {financialError}
                </p>
              ) : (
                <p
                  className={`text-2xl font-bold leading-tight mt-1 tabular-nums ${
                    netProfit < 0 ? "text-[hsl(var(--status-danger))]" : "text-[hsl(var(--status-available))]"
                  }`}
                >
                  {formatCurrency(netProfit)}
                </p>
              )}
            </div>
          </div>

          {expensePerVehicleList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              لا توجد مصروفات مرتبطة بالسيارات
            </p>
          ) : (
            <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
              {expensePerVehicleList.map((item) => (
                <button
                  key={item.vehicle!.id}
                  onClick={() => navigate(`/vehicles/${item.vehicle!.id}`)}
                  className="w-full text-right px-4 py-3 flex items-center justify-between hover:bg-muted/40 active:bg-muted transition-colors"
                >
                  <span className="text-sm font-semibold text-foreground">
                    {item.vehicle!.make} {item.vehicle!.model}
                  </span>
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    {formatCurrency(item.amount)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Fleet insights ────────────────────────────────────────────── */}
        <section>
          <SectionHeader title="رؤى السيارات" />
          {analyticsLoading ? (
            <p className="rounded-2xl border border-border bg-card p-5 text-center text-sm text-muted-foreground" role="status">جارٍ تحميل رؤى السيارات...</p>
          ) : hasAnalyticsError ? (
            <p className="rounded-2xl border border-border bg-card p-5 text-center text-sm text-destructive" role="alert">{analyticsError}</p>
          ) : profitability.length === 0 && Object.keys(lifetimeMaintenanceCost).length === 0 ? (
            <p className="rounded-2xl border border-border bg-card p-5 text-center text-sm text-muted-foreground">لا توجد بيانات كافية لرؤى السيارات</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-bold text-foreground">تكلفة الصيانة</h3>
                <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
                  {[...new Set([
                    ...Object.keys(lifetimeMaintenanceCost),
                    ...Object.keys(yearlyMaintenanceCost),
                  ])].map((vehicleId) => {
                    const vehicle = realVehicles.find((item) => item.id === vehicleId);
                    if (!vehicle) return null;
                    return (
                      <button key={vehicleId} type="button" onClick={() => navigate(`/vehicles/${vehicleId}`)} className="flex w-full items-center justify-between px-4 py-3 text-right hover:bg-muted/40">
                        <span className="text-sm font-semibold text-foreground">{vehicle.make} {vehicle.model}</span>
                        <span className="text-left text-xs text-muted-foreground">
                          <span className="block">السنة: <strong className="text-foreground">{formatCurrency(yearlyMaintenanceCost[vehicleId] ?? 0)}</strong></span>
                          <span className="block">مدى الحياة: <strong className="text-foreground">{formatCurrency(lifetimeMaintenanceCost[vehicleId] ?? 0)}</strong></span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-bold text-foreground">ربحية السيارات</h3>
                <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
                  {profitability.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">لا توجد بيانات ربحية مسجّلة</p>
                  ) : profitability.map((item) => {
                    const vehicle = realVehicles.find((candidate) => candidate.id === item.vehicleId);
                    if (!vehicle) return null;
                    return (
                      <button key={item.vehicleId} type="button" onClick={() => navigate(`/vehicles/${item.vehicleId}`)} className="flex w-full items-center justify-between px-4 py-3 text-right hover:bg-muted/40">
                        <span className="text-sm font-semibold text-foreground">{vehicle.make} {vehicle.model}</span>
                        <span className={`text-sm font-bold tabular-nums ${item.profit < 0 ? "text-[hsl(var(--status-danger))]" : "text-[hsl(var(--status-available))]"}`}>
                          {formatCurrency(item.profit)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── Bottom row: Fleet + Summary + Top debtor ─────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">

        {/* ── Section 3: Fleet status ────────────────────────────────────── */}
        <section>
          <SectionHeader title="حالة السيارات" />

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="rounded-xl bg-[hsl(var(--status-available-bg))] text-[hsl(var(--status-available))] p-3 text-center">
              <p className="text-2xl font-bold">{availableCount}</p>
              <p className="text-xs font-medium mt-0.5">{VEHICLE_STATUS_LABELS.available}</p>
            </div>
            <div className="rounded-xl bg-[hsl(var(--status-rented-bg))] text-[hsl(var(--status-rented))] p-3 text-center">
              <p className="text-2xl font-bold">{rentedCount}</p>
              <p className="text-xs font-medium mt-0.5">{VEHICLE_STATUS_LABELS.rented}</p>
            </div>
            <div className="rounded-xl bg-[hsl(var(--status-maintenance-bg))] text-[hsl(var(--status-maintenance))] p-3 text-center">
              <p className="text-2xl font-bold">{maintenanceCount}</p>
              <p className="text-xs font-medium mt-0.5">{VEHICLE_STATUS_LABELS.maintenance}</p>
            </div>
          </div>

          {/* Currently rented */}
          {rentedVehicles.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                المؤجرة الآن
              </p>
              <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
                {rentedVehicles.map((v) => {
                  const rental = activeRentals.find((r) => r.vehicleIds.includes(v.id));
                  const customer = rental ? getCustomerById(rental.customerId) : null;
                  return (
                    <button
                      key={v.id}
                      onClick={() => navigate(`/vehicles/${v.id}`)}
                      className="w-full text-right px-4 py-3 flex items-center justify-between hover:bg-muted/40 active:bg-muted transition-colors"
                    >
                      <StatusBadge status="rented" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {v.make} {v.model}
                        </p>
                        {customer && (
                          <p className="text-xs text-muted-foreground">{customer.name}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Currently under maintenance */}
          {maintenanceVehicles.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                قيد الصيانة الآن
              </p>
              <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
                {maintenanceVehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => navigate(`/vehicles/${v.id}`)}
                    className="w-full text-right px-4 py-3 flex items-center justify-between hover:bg-muted/40 active:bg-muted transition-colors"
                  >
                    <StatusBadge status="maintenance" />
                    <p className="text-sm font-semibold text-foreground">
                      {v.make} {v.model}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Section 4: Quick stats ─────────────────────────────────────── */}
        <section>
          <SectionHeader title="ملخص عام" />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[hsl(var(--status-available-bg))] flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} className="text-[hsl(var(--status-available))]" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground leading-tight">{endedCount}</p>
                <p className="text-xs text-muted-foreground">إيجار مكتمل</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Users size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground leading-tight">{customers.length}</p>
                <p className="text-xs text-muted-foreground">عميل مسجّل</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 5: Top debtor ──────────────────────────────────────── */}
        {topDebtor && (
          <section>
            <SectionHeader title="العميل ذو الرصيد الأعلى" />
            <button
              onClick={() => navigate(`/customers/${topDebtor.customer.id}`)}
              className="w-full text-right rounded-2xl border border-[hsl(var(--status-danger-bg))] bg-card p-4 hover:bg-muted/40 active:bg-muted transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-left shrink-0">
                  <p className="text-lg font-bold text-[hsl(var(--status-danger))] tabular-nums leading-tight">
                    {formatCurrency(topDebtor.balance)}
                  </p>
                  <p className="text-xs text-muted-foreground">رصيد متبقٍّ</p>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">{topDebtor.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{topDebtor.customer.location}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--status-danger-bg))] flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[hsl(var(--status-danger))]">
                      {topDebtor.customer.name.charAt(0)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </section>
        )}

        </div>

      </div>
    </div>
  );
}
