import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/layout/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ErrorState,
  InfoBanner,
  LoadingState,
} from "@/components/ui/FeedbackState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format";
import { VEHICLE_STATUS_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
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
  getExpenseTotalForPeriod,
  getExpenseTotalPerVehicle,
  getNetProfit,
} from "@/features/expenses/selectors";
import {
  usePayments,
  useOrgOutstandingBalances,
} from "@/features/payments/hooks";
import {
  getOutstandingPerCustomer,
  getPaymentRevenueForPeriod,
  getPaymentRevenuePerVehicle,
  getTotalOutstanding,
  type RentalOutstandingBalance,
} from "@/features/payments/selectors";
import {
  getBusinessPerformanceTrend,
  getVehicleProfitability,
  getYearlyMaintenanceCostPerVehicle,
} from "@/features/reports/selectors";
import { useListCustomers, useListVehicles } from "@workspace/api-client-react";
import { getApiErrorMessage } from "@/lib/api-error";
import type {
  ExpenseResponse,
  MaintenanceResponse,
  RentalResponse,
} from "@workspace/api-client-react";

const MOCK_YEAR = 2025;
const ANALYTICS_YEARS = [2026, 2025, 2024];
const ANALYTICS_MONTHS = ["كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"];

type AnalyticsVehicle = {
  id: string;
  make: string;
  model: string;
  year?: number;
  plateNumber?: string;
};

const trendChartConfig = {
  revenue: { label: "الإيرادات", color: "hsl(var(--primary))" },
  expenses: { label: "المصروفات", color: "hsl(var(--status-danger))" },
  netProfit: { label: "صافي الربح", color: "hsl(var(--status-available))" },
} satisfies ChartConfig;

function vehicleName(vehicle: AnalyticsVehicle) {
  return `${vehicle.make} ${vehicle.model}${vehicle.year ? ` ${vehicle.year}` : ""}`;
}

function VehicleIdentity({ vehicle }: { vehicle: AnalyticsVehicle }) {
  return (
    <span className="min-w-0">
      <span className="block truncate text-sm font-semibold text-foreground">
        {vehicleName(vehicle)}
      </span>
      {vehicle.plateNumber && (
        <span dir="ltr" className="mt-0.5 block text-xs text-muted-foreground">
          {vehicle.plateNumber}
        </span>
      )}
    </span>
  );
}

function MetricValue({
  value,
  isLoading,
  isError,
  className,
}: {
  value: number;
  isLoading: boolean;
  isError: boolean;
  className?: string;
}) {
  if (isLoading)
    return (
      <span className="mt-2 block text-sm font-medium text-muted-foreground">
        جارٍ التحميل...
      </span>
    );
  if (isError)
    return (
      <span className="mt-2 block text-sm font-medium text-destructive">
        تعذر تحميل القيمة
      </span>
    );
  return (
    <span
      className={cn(
        "mt-2 block text-2xl font-bold tracking-tight tabular-nums",
        className,
      )}
    >
      {formatCurrency(value)}
    </span>
  );
}

function MetricCard({
  label,
  context,
  value,
  icon: Icon,
  isLoading,
  isError,
  tone = "primary",
  trend,
}: {
  label: string;
  context: string;
  value: number;
  icon: typeof WalletCards;
  isLoading: boolean;
  isError: boolean;
  tone?: "primary" | "positive" | "danger" | "warning";
  trend?: React.ReactNode;
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    positive: "bg-status-positive-bg text-status-positive",
    danger: "bg-status-danger-bg text-status-danger",
    warning: "bg-status-warning-bg text-status-warning",
  };
  return (
    <SectionCard className="min-h-[156px]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="mt-1 text-xs text-muted-foreground">{context}</p>
        </div>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            toneClasses[tone],
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <MetricValue value={value} isLoading={isLoading} isError={isError} />
      {trend && !isLoading && !isError && (
        <div className="mt-3 text-xs text-muted-foreground">{trend}</div>
      )}
    </SectionCard>
  );
}

function PerformanceTrend({
  points,
  year,
}: {
  points: ReturnType<typeof getBusinessPerformanceTrend>;
  year: number;
}) {
  const hasData = points.some(
    (point) => point.revenue !== 0 || point.expenses !== 0,
  );
  const revenueValues = points.map((point) => point.revenue);
  const chartData = points.map((point) => ({
    ...point,
    label: point.period.slice(5),
  }));
  if (!hasData)
    return (
      <EmptyState
        icon={BarChart3}
        title="لا توجد بيانات أداء لهذه السنة"
        description="ستظهر اتجاهات الإيرادات والمصروفات بعد تسجيل العمليات المالية."
        className="py-8"
      />
    );
  return (
    <div className="space-y-4">
      <div
        className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground"
        aria-label="مفتاح اتجاه أداء الأعمال"
      >
        {[
          ["الإيرادات", "bg-primary"],
          ["المصروفات", "bg-status-danger"],
          ["صافي الربح", "bg-status-positive"],
        ].map(([label, color]) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <span
              className={cn("size-2.5 rounded-full", color)}
              aria-hidden="true"
            />
            {label}
          </span>
        ))}
      </div>
      <ChartContainer
        config={trendChartConfig}
        className="h-[260px] w-full aspect-auto sm:h-[300px]"
      >
        <LineChart
          data={chartData}
          margin={{ top: 24, right: 22, bottom: 4, left: 12 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 4" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            minTickGap={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            width={72}
            tickFormatter={(value: number) => formatCurrency(value)}
          />
          <ChartTooltip
            cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "3 3" }}
            content={
              <ChartTooltipContent
                formatter={(value) => formatCurrency(Number(value))}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-revenue)"
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="var(--color-expenses)"
            strokeWidth={2}
            dot={{ r: 2.5 }}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="netProfit"
            stroke="var(--color-netProfit)"
            strokeWidth={2}
            dot={{ r: 2.5 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ChartContainer>
      <div className="flex items-center justify-between gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
        <span>
          الأدنى:{" "}
          <strong className="ms-1 tabular-nums text-foreground">
            {formatCurrency(Math.min(...revenueValues))}
          </strong>
        </span>
        <span>
          الأعلى:{" "}
          <strong className="ms-1 tabular-nums text-foreground">
            {formatCurrency(Math.max(...revenueValues))}
          </strong>
        </span>
      </div>
      <p className="sr-only">اتجاه أداء الأعمال لسنة {year}</p>
      <details className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
        <summary className="cursor-pointer font-semibold text-foreground">عرض البيانات الشهرية كجدول</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-right text-xs">
            <thead className="border-b border-border text-muted-foreground"><tr><th className="pb-2 font-medium">الشهر</th><th className="pb-2 font-medium">الإيرادات</th><th className="pb-2 font-medium">المصروفات</th><th className="pb-2 font-medium">صافي الربح</th></tr></thead>
            <tbody>{points.map((point) => <tr key={point.period} className="border-b border-border/60 last:border-0"><td className="py-2">{point.period}</td><td dir="ltr" className="py-2 tabular-nums">{formatCurrency(point.revenue)}</td><td dir="ltr" className="py-2 tabular-nums">{formatCurrency(point.expenses)}</td><td dir="ltr" className="py-2 tabular-nums">{formatCurrency(point.netProfit)}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function deriveAnalytics(
  vehicles: ReturnType<typeof useVehicles>,
  rentals: ReturnType<typeof useRentals>,
  customers: ReturnType<typeof useCustomers>,
  getCustomerById: (id: string) => import("@/data/types").Customer | undefined,
  maintenance: MaintenanceResponse[],
  realVehicles: AnalyticsVehicle[],
  expenses: ExpenseResponse[],
  payments: ReturnType<typeof usePayments>["payments"],
  apiRentals: RentalResponse[],
  outstandingBalances: RentalOutstandingBalance[],
  realCustomersById: Map<
    string,
    { id: string; name: string; location: string }
  >,
  selectedYear: number,
  selectedMonth: number,
) {
  const previousPeriod = selectedMonth === 0 ? { month: 11, year: selectedYear - 1 } : { month: selectedMonth - 1, year: selectedYear };
  const thisMonthRevenue = getPaymentRevenueForPeriod(
    payments,
    selectedMonth,
    selectedYear,
  );
  const prevMonthRevenue = getPaymentRevenueForPeriod(
    payments,
    previousPeriod.month,
    previousPeriod.year,
  );
  const vehicleRevenueThisMonth = getPaymentRevenuePerVehicle(
    payments,
    apiRentals,
    selectedMonth,
    selectedYear,
  );
  const revenueChange =
    prevMonthRevenue > 0
      ? Math.round(
          ((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100,
        )
      : null;
  const totalPending = getTotalOutstanding(outstandingBalances);
  const vehicleRevenueList = Object.entries(vehicleRevenueThisMonth)
    .map(([vehicleId, amount]) => ({
      vehicle: realVehicles.find((vehicle) => vehicle.id === vehicleId),
      amount,
    }))
    .filter(
      (item): item is { vehicle: AnalyticsVehicle; amount: number } =>
        Boolean(item.vehicle) && item.amount > 0,
    )
    .sort((a, b) => b.amount - a.amount);
  const {
    available: availableCount,
    rented: rentedCount,
    maintenance: maintenanceCount,
  } = getVehicleStatusCounts(vehicles);
  const customerBalance = getOutstandingPerCustomer(outstandingBalances);
  const customerOutstandingList = Object.entries(customerBalance)
    .map(([customerId, balance]) => ({
      customer: realCustomersById.get(customerId),
      balance,
    }))
    .filter(
      (
        item,
      ): item is {
        customer: { id: string; name: string; location: string };
        balance: number;
      } => Boolean(item.customer) && item.balance > 0,
    )
    .sort((a, b) => b.balance - a.balance);
  const maintenanceCostPerVehicle = getMaintenanceCostPerVehicle(maintenance);
  const maintenanceCostList = Object.entries(maintenanceCostPerVehicle)
    .map(([vehicleId, cost]) => ({
      vehicle: realVehicles.find((vehicle) => vehicle.id === vehicleId),
      cost,
    }))
    .filter(
      (item): item is { vehicle: AnalyticsVehicle; cost: number } =>
        Boolean(item.vehicle) && item.cost > 0,
    )
    .sort((a, b) => b.cost - a.cost);
  const expenseTotalForPeriod = getExpenseTotalForPeriod(
    expenses,
    selectedMonth,
    selectedYear,
  );
  const expensePerVehicleList = Object.entries(
    getExpenseTotalPerVehicle(expenses),
  )
    .map(([vehicleId, amount]) => ({
      vehicle: realVehicles.find((vehicle) => vehicle.id === vehicleId),
      amount,
    }))
    .filter(
      (item): item is { vehicle: AnalyticsVehicle; amount: number } =>
        Boolean(item.vehicle) && item.amount > 0,
    )
    .sort((a, b) => b.amount - a.amount);
  return {
    thisMonthRevenue,
    prevMonthRevenue,
    revenueChange,
    revenueUp: revenueChange !== null && revenueChange >= 0,
    totalPending,
    activeRentals: getActiveRentals(rentals),
    vehicleRevenueList,
    maxVehicleRevenue: vehicleRevenueList[0]?.amount ?? 1,
    availableCount,
    rentedCount,
    maintenanceCount,
    rentedVehicles: getVehiclesByStatus(vehicles, "rented"),
    maintenanceVehicles: getVehiclesByStatus(vehicles, "maintenance"),
    maintenanceCostList,
    expenseTotalForPeriod,
    expensePerVehicleList,
    netProfit: getNetProfit(thisMonthRevenue, expenseTotalForPeriod),
    endedCount: getEndedRentals(rentals).length,
    customerOutstandingList,
    performanceTrend: getBusinessPerformanceTrend(
      payments,
      expenses,
      selectedYear,
    ),
    yearlyMaintenanceCost: getYearlyMaintenanceCostPerVehicle(
      maintenance,
      selectedYear,
    ),
    profitability: getVehicleProfitability(
      payments,
      apiRentals,
      expenses,
      maintenance,
    ),
    lifetimeMaintenanceCost: maintenanceCostPerVehicle,
  };
}

export default function AnalyticsPage() {
  const [, navigate] = useLocation();
  const [selectedYear, setSelectedYear] = useState(MOCK_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const vehicles = useVehicles();
  const rentals = useRentals();
  const customers = useCustomers();
  const getCustomerById = useCustomerById();
  const maintenanceQuery = useMaintenance();
  const maintenance = maintenanceQuery.data?.data ?? [];
  const realVehiclesQuery = useListVehicles();
  const realVehicles = realVehiclesQuery.data?.data ?? [];
  const expensesQuery = useExpenses();
  const expenses = expensesQuery.data?.data ?? [];
  const paymentsQuery = usePayments();
  const payments = paymentsQuery.payments;
  const outstandingQuery = useOrgOutstandingBalances();
  const apiRentals = outstandingQuery.rentals;
  const outstandingBalances = outstandingQuery.balances;
  const realCustomersQuery = useListCustomers();
  const realCustomers = realCustomersQuery.data?.data ?? [];
  const realCustomersById = useMemo(
    () =>
      new Map(
        realCustomers.map((customer) => [
          customer.id,
          {
            id: customer.id,
            name: `${customer.firstName} ${customer.lastName}`.trim(),
            location: customer.address,
          },
        ]),
      ),
    [realCustomers],
  );
  const analytics = deriveAnalytics(
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
    selectedMonth,
  );
  const financialLoading =
    paymentsQuery.isLoading ||
    expensesQuery.isLoading ||
    outstandingQuery.isLoading;
  const financialFailure =
    paymentsQuery.error ?? expensesQuery.error ?? outstandingQuery.error;
  const hasFinancialError = Boolean(financialFailure);
  const financialError = getApiErrorMessage(financialFailure).title;
  const analyticsLoading =
    maintenanceQuery.isLoading ||
    realVehiclesQuery.isLoading ||
    financialLoading;
  const analyticsFailure =
    maintenanceQuery.error ?? realVehiclesQuery.error ?? financialFailure;
  const hasAnalyticsError = Boolean(analyticsFailure);
  const analyticsError = getApiErrorMessage(analyticsFailure).title;
  const revenueTrend =
    analytics.revenueChange !== null ? (
      <span
        className={cn(
          "inline-flex items-center gap-1",
          analytics.revenueUp ? "text-status-positive" : "text-status-danger",
        )}
      >
        {analytics.revenueUp ? (
          <TrendingUp className="size-3.5" aria-hidden="true" />
        ) : (
          <TrendingDown className="size-3.5" aria-hidden="true" />
        )}
        {analytics.revenueUp ? "+" : ""}
        {analytics.revenueChange}٪ مقارنةً بالشهر السابق
      </span>
    ) : null;

  return (
    <div className="min-h-full">
      <PageHeader title="التحليلات" showBack />
      <main className="space-y-5 px-4 pb-8 pt-4 sm:px-6 lg:space-y-6 lg:pt-6">
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 xl:flex-row xl:items-end">
          <div>
            <p className="ui-section-title">نظرة مالية وتشغيلية</p>
            <p className="ui-secondary-text mt-1">
              راجع الإيرادات والمصروفات وأداء المركبات خلال الفترة المحددة.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
          <label className="relative flex min-h-11 min-w-[12rem] flex-1 items-center gap-2 rounded-lg border border-border bg-card ps-3 pe-3 text-sm font-medium text-foreground shadow-xs transition-shadow focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-ring/40 sm:flex-none">
            <CalendarDays className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="shrink-0 text-muted-foreground">سنة التحليل</span>
            <select
              aria-label="سنة التحليل"
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              className="min-w-0 flex-1 appearance-none bg-transparent py-1 text-end outline-none"
            >
              {ANALYTICS_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 size-4 text-muted-foreground" aria-hidden="true" />
          </label>
          <label className="relative flex min-h-11 min-w-[15rem] flex-1 items-center gap-2 rounded-lg border border-border bg-card ps-3 pe-3 text-sm font-medium text-foreground shadow-xs transition-shadow focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-ring/40 sm:flex-none">
            <CalendarDays className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="shrink-0 text-muted-foreground">شهر الملخص</span>
            <select aria-label="شهر الملخص" value={selectedMonth} onChange={(event) => setSelectedMonth(Number(event.target.value))} className="min-w-0 flex-1 appearance-none bg-transparent py-1 text-end outline-none">
              {ANALYTICS_MONTHS.map((month, index) => <option key={month} value={index}>{month}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 size-4 text-muted-foreground" aria-hidden="true" />
          </label>
          </div>
        </div>
        <InfoBanner>يعرض الملخص المالي شهر {ANALYTICS_MONTHS[selectedMonth]} {selectedYear}. تشمل رؤى المركبات بيانات السجلات المتاحة، وقد تختلف عن نطاق الشهر المحدد.</InfoBanner>
        {hasFinancialError && (
          <InfoBanner className="border-status-danger/25 bg-status-danger-bg text-status-danger">
            تعذر تحديث بعض البيانات المالية: {financialError}
          </InfoBanner>
        )}
        <section
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="ملخص الأداء المالي"
        >
          <MetricCard
            label="إجمالي الإيرادات"
            context={`${ANALYTICS_MONTHS[selectedMonth]} ${selectedYear}`}
            value={analytics.thisMonthRevenue}
            icon={WalletCards}
            isLoading={financialLoading}
            isError={hasFinancialError}
            trend={revenueTrend}
          />
          <MetricCard
            label="الأرصدة المستحقة"
            context="الرصيد المتبقي من الإيجارات"
            value={analytics.totalPending}
            icon={CircleDollarSign}
            isLoading={outstandingQuery.isLoading}
            isError={Boolean(outstandingQuery.error)}
            tone="danger"
          />
          <MetricCard
            label="صافي الربح"
            context={`${ANALYTICS_MONTHS[selectedMonth]} ${selectedYear}`}
            value={analytics.netProfit}
            icon={TrendingUp}
            isLoading={financialLoading}
            isError={hasFinancialError}
            tone="positive"
          />
          <MetricCard
            label="مصروفات الفترة"
            context={`${ANALYTICS_MONTHS[selectedMonth]} ${selectedYear}`}
            value={analytics.expenseTotalForPeriod}
            icon={TrendingDown}
            isLoading={expensesQuery.isLoading}
            isError={Boolean(expensesQuery.error)}
            tone="warning"
          />
        </section>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.75fr)]">
          <SectionCard
            title={`اتجاه أداء الأعمال ${selectedYear}`}
            description="الإيرادات والمصروفات وصافي الربح حسب الشهر."
          >
            {analyticsLoading ? (
              <LoadingState rows={4} />
            ) : hasAnalyticsError ? (
              <ErrorState description={analyticsError} className="py-8" />
            ) : (
              <PerformanceTrend
                points={analytics.performanceTrend}
                year={selectedYear}
              />
            )}
          </SectionCard>
          <SectionCard
            title="الأرصدة المستحقة"
            description="العملاء ذوو الأرصدة المتبقية."
          >
            {outstandingQuery.isLoading ? (
              <LoadingState rows={4} />
            ) : outstandingQuery.error ? (
              <ErrorState
                description={getApiErrorMessage(outstandingQuery.error).title}
                className="py-8"
              />
            ) : analytics.customerOutstandingList.length === 0 ? (
              <EmptyState
                icon={CircleDollarSign}
                title="لا توجد أرصدة مستحقة"
                description="كل الإيجارات المسجلة مدفوعة بالكامل."
                className="py-8"
              />
            ) : (
              <div className="divide-y divide-border">
                {analytics.customerOutstandingList
                  .slice(0, 5)
                  .map(({ customer, balance }) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => navigate(`/customers/${customer.id}`)}
                      className="flex w-full items-center justify-between gap-3 py-3 text-right transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {customer.name}
                        </p>
                        {customer.location && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {customer.location}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-bold tabular-nums text-status-danger">
                        {formatCurrency(balance)}
                      </span>
                    </button>
                  ))}
                <div className="flex items-center justify-between gap-3 pt-4 text-sm">
                  <span className="font-semibold text-muted-foreground">
                    إجمالي الأرصدة المستحقة
                  </span>
                  <strong className="shrink-0 text-base tabular-nums text-foreground">
                    {formatCurrency(analytics.totalPending)}
                  </strong>
                </div>
              </div>
            )}
          </SectionCard>
        </div>
        <section aria-labelledby="vehicle-insights-heading">
          <div className="mb-3">
            <h2 id="vehicle-insights-heading" className="ui-section-title">
              رؤى السيارات
            </h2>
            <p className="ui-secondary-text mt-1">
              مقارنة الربحية وتكاليف الصيانة حسب المركبة.
            </p>
          </div>
          {analyticsLoading ? (
            <SectionCard>
              <LoadingState rows={4} />
            </SectionCard>
          ) : hasAnalyticsError ? (
            <SectionCard>
              <ErrorState description={analyticsError} className="py-8" />
            </SectionCard>
          ) : analytics.profitability.length === 0 &&
            Object.keys(analytics.lifetimeMaintenanceCost).length === 0 ? (
            <SectionCard>
              <EmptyState
                icon={BarChart3}
                title="لا توجد بيانات كافية لرؤى السيارات"
                description="ستظهر الربحية وتكاليف الصيانة بعد تسجيل العمليات ذات الصلة."
                className="py-8"
              />
            </SectionCard>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              <SectionCard
                title="أكثر المركبات ربحاً"
                description="الربحية وفق البيانات المسجلة مدى الحياة."
              >
                {analytics.profitability.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    لا توجد بيانات ربحية مسجّلة
                  </p>
                ) : (
                  <div className="space-y-4">
                    {analytics.profitability.slice(0, 5).map((item, index) => {
                      const vehicle = realVehicles.find(
                        (candidate) => candidate.id === item.vehicleId,
                      );
                      if (!vehicle) return null;
                      const width = Math.max(
                        8,
                        Math.round(
                          (Math.abs(item.profit) /
                            Math.max(
                              Math.abs(analytics.profitability[0]?.profit ?? 0),
                              1,
                            )) *
                            100,
                        ),
                      );
                      return (
                        <button
                          key={item.vehicleId}
                          type="button"
                          onClick={() =>
                            navigate(`/vehicles/${item.vehicleId}`)
                          }
                          className="w-full text-right"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-2.5">
                              <span className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                                {index + 1}
                              </span>
                              <VehicleIdentity vehicle={vehicle} />
                            </div>
                            <strong
                              className={cn(
                                "shrink-0 text-sm tabular-nums",
                                item.profit < 0
                                  ? "text-status-danger"
                                  : "text-status-positive",
                              )}
                            >
                              {formatCurrency(item.profit)}
                            </strong>
                          </div>
                          <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted">
                            <span
                              className={cn(
                                "block h-full rounded-full",
                                item.profit < 0
                                  ? "bg-status-danger"
                                  : "bg-primary",
                              )}
                              style={{ width: `${width}%` }}
                            />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </SectionCard>
              <SectionCard
                title="تكاليف الصيانة"
                description={`تكلفة السنة ${selectedYear} ومدى الحياة لكل مركبة.`}
              >
                <div className="divide-y divide-border">
                  {[
                    ...new Set([
                      ...Object.keys(analytics.lifetimeMaintenanceCost),
                      ...Object.keys(analytics.yearlyMaintenanceCost),
                    ]),
                  ].map((vehicleId) => {
                    const vehicle = realVehicles.find(
                      (candidate) => candidate.id === vehicleId,
                    );
                    if (!vehicle) return null;
                    return (
                      <button
                        key={vehicleId}
                        type="button"
                        onClick={() => navigate(`/vehicles/${vehicleId}`)}
                        className="flex w-full items-start justify-between gap-3 py-3 text-right transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                      >
                        <VehicleIdentity vehicle={vehicle} />
                        <span className="shrink-0 text-left text-xs text-muted-foreground">
                          <span className="block">
                            السنة:{" "}
                            <strong className="tabular-nums text-foreground">
                              {formatCurrency(
                                analytics.yearlyMaintenanceCost[vehicleId] ?? 0,
                              )}
                            </strong>
                          </span>
                          <span className="mt-1 block">
                            مدى الحياة:{" "}
                            <strong className="tabular-nums text-foreground">
                              {formatCurrency(
                                analytics.lifetimeMaintenanceCost[vehicleId] ??
                                  0,
                              )}
                            </strong>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </SectionCard>
            </div>
          )}
        </section>
        <div className="grid gap-5 xl:grid-cols-2">
          <SectionCard
            title="إيرادات السيارات هذا الشهر"
            action={
              <button
                type="button"
                onClick={() => navigate("/vehicles")}
                className="text-sm font-semibold text-primary hover:underline"
              >
                عرض المركبات
              </button>
            }
          >
            {financialLoading ? (
              <LoadingState rows={3} />
            ) : hasFinancialError ? (
              <ErrorState description={financialError} className="py-8" />
            ) : analytics.vehicleRevenueList.length === 0 ? (
              <EmptyState
                icon={WalletCards}
                title="لا توجد إيرادات سيارات هذا الشهر"
                description="ستظهر الإيرادات بعد تسجيل الدفعات للإيجارات."
                className="py-8"
              />
            ) : (
              <div className="space-y-4">
                {analytics.vehicleRevenueList
                  .slice(0, 5)
                  .map(({ vehicle, amount }, index) => {
                    const width = Math.max(
                      8,
                      Math.round((amount / analytics.maxVehicleRevenue) * 100),
                    );
                    return (
                      <button
                        key={vehicle.id}
                        type="button"
                        onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                        className="w-full text-right"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-2">
                            <VehicleIdentity vehicle={vehicle} />
                            {index === 0 && (
                              <span className="mt-0.5 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                الأعلى
                              </span>
                            )}
                          </div>
                          <strong className="shrink-0 text-sm tabular-nums text-foreground">
                            {formatCurrency(amount)}
                          </strong>
                        </div>
                        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted">
                          <span
                            className="block h-full rounded-full bg-primary"
                            style={{ width: `${width}%` }}
                          />
                        </span>
                      </button>
                    );
                  })}
              </div>
            )}
          </SectionCard>
          <SectionCard
            title="حالة الأسطول"
            description="حالة المركبات الحالية والإيجارات المكتملة."
          >
            <div className="grid grid-cols-3 gap-2">
              {[
                [
                  "available",
                  analytics.availableCount,
                  "bg-status-positive-bg text-status-positive",
                ],
                [
                  "rented",
                  analytics.rentedCount,
                  "bg-status-info-bg text-status-info",
                ],
                [
                  "maintenance",
                  analytics.maintenanceCount,
                  "bg-status-warning-bg text-status-warning",
                ],
              ].map(([status, count, tone]) => (
                <div
                  key={status}
                  className={cn("rounded-lg p-3 text-center", tone)}
                >
                  <p className="text-2xl font-bold tabular-nums">{count}</p>
                  <p className="mt-1 text-xs font-semibold">
                    {
                      VEHICLE_STATUS_LABELS[
                        status as keyof typeof VEHICLE_STATUS_LABELS
                      ]
                    }
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm">
              <span className="text-muted-foreground">إيجارات مكتملة</span>
              <strong className="tabular-nums text-foreground">
                {analytics.endedCount}
              </strong>
            </div>
            {(analytics.rentedVehicles.length > 0 ||
              analytics.maintenanceVehicles.length > 0) && (
              <div className="mt-4 divide-y divide-border border-t border-border">
                {[
                  ...analytics.rentedVehicles.map((vehicle) => ({
                    vehicle,
                    status: "rented" as const,
                  })),
                  ...analytics.maintenanceVehicles.map((vehicle) => ({
                    vehicle,
                    status: "maintenance" as const,
                  })),
                ]
                  .slice(0, 4)
                  .map(({ vehicle, status }) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                      className="flex w-full items-center justify-between gap-3 py-3 text-right"
                    >
                      <StatusBadge status={status} />
                      <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                        {vehicle.make} {vehicle.model}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </SectionCard>
        </div>
        {(analytics.maintenanceCostList.length > 0 ||
          analytics.expensePerVehicleList.length > 0) && (
          <section className="grid gap-5 xl:grid-cols-2">
            <SectionCard
              title="أعلى تكاليف الصيانة"
              action={
                <button
                  type="button"
                  onClick={() => navigate("/maintenance")}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  عرض الصيانة
                </button>
              }
            >
              <div className="divide-y divide-border">
                {analytics.maintenanceCostList
                  .slice(0, 5)
                  .map(({ vehicle, cost }) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                      className="flex w-full items-start justify-between gap-3 py-3 text-right"
                    >
                      <VehicleIdentity vehicle={vehicle} />
                      <strong className="shrink-0 text-sm tabular-nums text-foreground">
                        {formatCurrency(cost)}
                      </strong>
                    </button>
                  ))}
              </div>
            </SectionCard>
            <SectionCard
              title="مصروفات مرتبطة بالمركبات"
              action={
                <button
                  type="button"
                  onClick={() => navigate("/expenses")}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  عرض المصروفات
                </button>
              }
            >
              <div className="divide-y divide-border">
                {analytics.expensePerVehicleList
                  .slice(0, 5)
                  .map(({ vehicle, amount }) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                      className="flex w-full items-start justify-between gap-3 py-3 text-right"
                    >
                      <VehicleIdentity vehicle={vehicle} />
                      <strong className="shrink-0 text-sm tabular-nums text-foreground">
                        {formatCurrency(amount)}
                      </strong>
                    </button>
                  ))}
              </div>
            </SectionCard>
          </section>
        )}
      </main>
    </div>
  );
}
