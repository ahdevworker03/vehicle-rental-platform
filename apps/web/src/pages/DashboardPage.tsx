import { useMemo } from "react";
import { useLocation } from "wouter";
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  ChevronLeft,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  FileWarning,
  HandCoins,
  Plus,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { useListVehicles } from "@workspace/api-client-react";
import type {
  ExpenseResponse,
  MaintenanceResponse,
  PaymentResponse,
  TaskResponse,
} from "@workspace/api-client-react";
import {
  DashboardMetricCard,
  type DashboardMetricState,
} from "@/components/dashboard/DashboardMetricCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  ErrorState,
  InfoBanner,
  LoadingState,
} from "@/components/ui/FeedbackState";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCustomerById } from "@/features/customers/hooks";
import { useExpenses } from "@/features/expenses/hooks";
import { getExpenseTotal } from "@/features/expenses/selectors";
import { useMaintenance } from "@/features/maintenance/hooks";
import {
  getMaintenanceCount,
  getOverdueMaintenance,
  getUpcomingMaintenance,
} from "@/features/maintenance/selectors";
import {
  useOrgOutstandingBalances,
  usePayments,
} from "@/features/payments/hooks";
import { getPaymentRevenueForPeriod } from "@/features/payments/selectors";
import { getBusinessPerformanceTrend } from "@/features/reports/selectors";
import { useRentals } from "@/features/rentals/hooks";
import {
  getActiveRentals,
  getRecentEndedRentals,
  getRentalsEndingSoon,
} from "@/features/rentals/selectors";
import { useTasks } from "@/features/tasks/hooks";
import { getPendingTaskCount, isTaskOverdue } from "@/features/tasks/selectors";
import { useVehicleById, useVehicles } from "@/features/vehicles/hooks";
import { getVehicleStatusCounts } from "@/features/vehicles/selectors";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatDate } from "@/lib/format";
import { MAINTENANCE_TYPES } from "@/lib/labels";
import { daysFromToday } from "@/lib/mock-date";
import { cn } from "@/lib/utils";
import type { Rental, Vehicle } from "@/data/types";

const MOCK_MONTH = 0;
const MOCK_YEAR = 2025;
const PREVIOUS_MONTH = 11;

type ApiVehicle = {
  id: string;
  make: string;
  model: string;
  plateNumber: string;
  status: string;
};

type AlertTone = "info" | "warning" | "danger";

function dueLabelFor(days: number): { text: string; tone: AlertTone } {
  if (days < 0) return { text: `متأخر ${Math.abs(days)} يوم`, tone: "danger" };
  if (days === 0) return { text: "مستحق اليوم", tone: "danger" };
  if (days === 1) return { text: "مستحق غداً", tone: "warning" };
  return { text: `بعد ${days} أيام`, tone: "info" };
}

function relativeTimeLabel(pastDays: number): string {
  if (pastDays === 0) return "اليوم";
  if (pastDays === 1) return "أمس";
  if (pastDays === 2) return "منذ يومين";
  return `منذ ${pastDays} أيام`;
}

function getMetricState(
  isLoading: boolean,
  isError: boolean,
): DashboardMetricState {
  if (isLoading) return "loading";
  if (isError) return "error";
  return "ready";
}

function deriveDashboard(
  vehicles: Vehicle[],
  rentals: Rental[],
  maintenance: MaintenanceResponse[],
  realVehicles: ApiVehicle[],
  expenses: ExpenseResponse[],
  payments: PaymentResponse[],
  outstandingBalance: number,
) {
  const vehicleCounts = getVehicleStatusCounts(vehicles);
  const activeRentals = getActiveRentals(rentals);
  const overdueReturns = activeRentals
    .filter((rental) => daysFromToday(rental.endDate) < 0)
    .sort(
      (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
    );
  const returningToday = activeRentals
    .filter((rental) => daysFromToday(rental.endDate) === 0)
    .sort(
      (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
    );
  const endingSoonRentals = getRentalsEndingSoon(rentals, daysFromToday).filter(
    (rental) => daysFromToday(rental.endDate) > 0,
  );
  const performanceTrend = getBusinessPerformanceTrend(
    payments,
    expenses,
    MOCK_YEAR,
  );

  return {
    activeRentals,
    availableCount: vehicleCounts.available,
    rentedCount: vehicleCounts.rented,
    maintenanceCount: getMaintenanceCount(maintenance),
    vehiclesUnderMaintenance: realVehicles.filter(
      (vehicle) => vehicle.status === "MAINTENANCE",
    ).length,
    outOfServiceCount: realVehicles.filter(
      (vehicle) => vehicle.status === "OUT_OF_SERVICE",
    ).length,
    totalExpenses: getExpenseTotal(expenses),
    monthlyRevenue: getPaymentRevenueForPeriod(payments, MOCK_MONTH, MOCK_YEAR),
    pendingBalance: outstandingBalance,
    overdueReturns,
    returningToday,
    endingSoonRentals,
    priorityReturns: [
      ...overdueReturns,
      ...returningToday,
      ...endingSoonRentals,
    ].slice(0, 4),
    overdueMaintenance: getOverdueMaintenance(maintenance),
    upcomingMaintenance: getUpcomingMaintenance(maintenance, daysFromToday, 7),
    recentActivity: getRecentEndedRentals(rentals, 4),
    currentPerformance: performanceTrend[MOCK_MONTH],
    previousPerformance: performanceTrend[PREVIOUS_MONTH],
  };
}

function DashboardAction({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: typeof Plus;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className="justify-center"
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </Button>
  );
}

function DashboardAlertRow({
  icon: Icon,
  tone,
  title,
  description,
  onClick,
}: {
  icon: typeof AlertTriangle;
  tone: AlertTone;
  title: string;
  description: string;
  onClick: () => void;
}) {
  const toneClass = {
    info: "bg-status-info-bg text-status-info",
    warning: "bg-status-warning-bg text-status-warning",
    danger: "bg-status-danger-bg text-status-danger",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/50 active:bg-muted"
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          toneClass,
        )}
      >
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {description}
        </span>
      </span>
      <ChevronLeft
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </button>
  );
}

function ActiveRentalRow({
  rental,
  vehicle,
  customerName,
  onClick,
}: {
  rental: Rental;
  vehicle: Vehicle | undefined;
  customerName: string | undefined;
  onClick: () => void;
}) {
  if (!vehicle || !customerName) return null;

  const due = dueLabelFor(daysFromToday(rental.endDate));
  const badgeStatus = due.tone === "danger" ? "overdue" : "ACTIVE";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/50 active:bg-muted"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-status-info-bg text-sm font-bold text-status-info">
        {customerName.slice(0, 1)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">
          {customerName}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {vehicle.make} {vehicle.model} · {formatDate(rental.endDate)}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <StatusBadge status={badgeStatus} label={due.text} />
        <span className="number-ltr text-xs font-medium text-muted-foreground">
          {formatCurrency(rental.totalAmount)}
        </span>
      </span>
    </button>
  );
}

function RecentActivityRow({
  rental,
  vehicle,
  customerName,
}: {
  rental: Rental;
  vehicle: Vehicle | undefined;
  customerName: string | undefined;
}) {
  if (!vehicle || !customerName || !rental.returnDate) return null;

  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-status-positive-bg text-status-positive">
        <CheckCircle2 className="size-[18px]" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">تم إنهاء عقد</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {vehicle.make} {vehicle.model} · {customerName}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {relativeTimeLabel(Math.abs(daysFromToday(rental.returnDate)))}
        </p>
      </div>
      <span className="number-ltr shrink-0 text-sm font-semibold text-foreground">
        {formatCurrency(rental.totalAmount)}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const vehicles = useVehicles();
  const rentals = useRentals();
  const maintenanceQuery = useMaintenance();
  const expensesQuery = useExpenses();
  const paymentsQuery = usePayments();
  const outstandingQuery = useOrgOutstandingBalances();
  const tasksQuery = useTasks();
  const vehiclesQuery = useListVehicles();
  const getVehicleById = useVehicleById();
  const getCustomerById = useCustomerById();

  const maintenance = maintenanceQuery.data?.data ?? [];
  const expenses = expensesQuery.data?.data ?? [];
  const payments = paymentsQuery.payments;
  const tasks = (tasksQuery.data?.data ?? []) as TaskResponse[];
  const realVehicles = (vehiclesQuery.data?.data ?? []) as ApiVehicle[];
  const pendingTasks = getPendingTaskCount(tasks);
  const overdueTasks = tasks.filter((task) => isTaskOverdue(task)).length;

  const realVehicleById = useMemo(
    () => new Map(realVehicles.map((vehicle) => [vehicle.id, vehicle])),
    [realVehicles],
  );

  const dashboard = deriveDashboard(
    vehicles,
    rentals,
    maintenance,
    realVehicles,
    expenses,
    payments,
    outstandingQuery.totalOutstanding ?? 0,
  );

  const financeLoading =
    paymentsQuery.isLoading ||
    expensesQuery.isLoading ||
    outstandingQuery.isLoading;
  const financeError =
    paymentsQuery.error ?? expensesQuery.error ?? outstandingQuery.error;
  const financeState = getMetricState(financeLoading, Boolean(financeError));
  const financeErrorMessage = financeError
    ? getApiErrorMessage(financeError).title
    : undefined;
  const tasksState = getMetricState(
    tasksQuery.isLoading,
    Boolean(tasksQuery.error),
  );
  const maintenanceState = getMetricState(
    maintenanceQuery.isLoading,
    Boolean(maintenanceQuery.error),
  );
  const fleetState = getMetricState(
    vehiclesQuery.isLoading,
    Boolean(vehiclesQuery.error),
  );
  const hasOperationalAlerts =
    dashboard.overdueReturns.length > 0 ||
    dashboard.returningToday.length > 0 ||
    dashboard.endingSoonRentals.length > 0 ||
    dashboard.overdueMaintenance.length > 0 ||
    (fleetState === "ready" && dashboard.vehiclesUnderMaintenance > 0) ||
    overdueTasks > 0 ||
    (financeState === "ready" && dashboard.pendingBalance > 0);

  return (
    <div className="min-h-full">
      <PageHeader
        title="لوحة التحكم"
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => setLocation("/rentals/new")}
          >
            <Plus className="size-4" aria-hidden="true" />
            إيجار جديد
          </Button>
        }
      />

      <div className="space-y-5 px-4 pb-4 sm:px-6 lg:space-y-6 lg:pb-6">
        <div className="flex flex-wrap gap-2 pt-1">
          <DashboardAction
            label="إعادة مركبة"
            icon={RotateCcw}
            onClick={() => setLocation("/rentals")}
          />
          <DashboardAction
            label="إضافة مركبة"
            icon={Car}
            onClick={() => setLocation("/vehicles/add")}
          />
          <DashboardAction
            label="تسجيل صيانة"
            icon={Wrench}
            onClick={() => setLocation("/maintenance/add")}
          />
        </div>

        <section aria-label="التنبيهات التشغيلية">
          <SectionCard
            title="ما يحتاج إلى متابعة"
            description="تنبيهات تشغيلية مرتبة حسب الأولوية"
            action={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/rentals")}
              >
                الإيجارات
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>
            }
            className="overflow-hidden"
          >
            {hasOperationalAlerts ? (
              <div className="-mx-4 -my-4 divide-y divide-border sm:-mx-5">
                {dashboard.overdueReturns.slice(0, 2).map((rental) => (
                  <DashboardAlertRow
                    key={`overdue-return-${rental.id}`}
                    icon={AlertTriangle}
                    tone="danger"
                    title="إيجار متأخر عن الإعادة"
                    description={`استحق في ${formatDate(rental.endDate)}`}
                    onClick={() => setLocation(`/rentals/${rental.id}`)}
                  />
                ))}
                {dashboard.returningToday.slice(0, 2).map((rental) => (
                  <DashboardAlertRow
                    key={`return-today-${rental.id}`}
                    icon={Clock3}
                    tone="warning"
                    title="إعادة مركبة مستحقة اليوم"
                    description={`موعد الإعادة ${formatDate(rental.endDate)}`}
                    onClick={() => setLocation(`/rentals/${rental.id}`)}
                  />
                ))}
                {dashboard.endingSoonRentals.slice(0, 2).map((rental) => (
                  <DashboardAlertRow
                    key={`return-soon-${rental.id}`}
                    icon={Clock3}
                    tone="info"
                    title="إعادة مركبة قريبة"
                    description={`موعد الإعادة ${formatDate(rental.endDate)}`}
                    onClick={() => setLocation(`/rentals/${rental.id}`)}
                  />
                ))}
                {fleetState === "ready" &&
                  dashboard.vehiclesUnderMaintenance > 0 && (
                    <DashboardAlertRow
                      icon={Wrench}
                      tone="warning"
                      title={`${dashboard.vehiclesUnderMaintenance} مركبات في الصيانة`}
                      description="راجع حالة الأسطول والمواعيد المرتبطة"
                      onClick={() => setLocation("/maintenance")}
                    />
                  )}
                {maintenanceState === "ready" &&
                  dashboard.overdueMaintenance.slice(0, 2).map((record) => {
                    const vehicle = realVehicleById.get(record.vehicleId);
                    const maintenanceType =
                      MAINTENANCE_TYPES[record.type]?.label ?? record.type;
                    return (
                      <DashboardAlertRow
                        key={`maintenance-${record.id}`}
                        icon={Wrench}
                        tone="danger"
                        title={`صيانة متأخرة: ${maintenanceType}`}
                        description={
                          vehicle
                            ? `${vehicle.make} ${vehicle.model}`
                            : `استحقت في ${formatDate(record.maintenanceDate)}`
                        }
                        onClick={() => setLocation("/maintenance")}
                      />
                    );
                  })}
                {tasksState === "ready" && overdueTasks > 0 && (
                  <DashboardAlertRow
                    icon={ClipboardList}
                    tone="danger"
                    title={`${overdueTasks} مهام متأخرة`}
                    description="تحتاج إلى الإكمال أو إعادة الجدولة"
                    onClick={() => setLocation("/tasks")}
                  />
                )}
                {financeState === "ready" && dashboard.pendingBalance > 0 && (
                  <DashboardAlertRow
                    icon={FileWarning}
                    tone="warning"
                    title="أرصدة مستحقة التحصيل"
                    description={formatCurrency(dashboard.pendingBalance)}
                    onClick={() => setLocation("/rentals")}
                  />
                )}
              </div>
            ) : (
              <InfoBanner icon={CheckCircle2}>
                لا توجد تنبيهات تشغيلية عاجلة حالياً.
              </InfoBanner>
            )}
          </SectionCard>
        </section>

        <section
          aria-label="نظرة تشغيلية سريعة"
          className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
        >
          <DashboardMetricCard
            label="الإيجارات النشطة"
            value={String(dashboard.activeRentals.length)}
            context="عقود قيد التنفيذ"
            icon={Car}
            tone="info"
            onClick={() => setLocation("/rentals")}
          />
          <DashboardMetricCard
            label="الإعادات القريبة"
            value={String(dashboard.priorityReturns.length)}
            context={
              dashboard.returningToday.length > 0
                ? `${dashboard.returningToday.length} مستحقة اليوم`
                : "خلال اليومين المقبلين"
            }
            icon={Clock3}
            tone={dashboard.overdueReturns.length > 0 ? "danger" : "warning"}
            onClick={() => setLocation("/rentals")}
          />
          <DashboardMetricCard
            label="المركبات المتاحة"
            value={String(dashboard.availableCount)}
            context="جاهزة للتأجير"
            icon={Car}
            tone="positive"
            onClick={() => setLocation("/vehicles?filter=available")}
          />
          <DashboardMetricCard
            label="المهام المفتوحة"
            value={String(pendingTasks)}
            context={
              overdueTasks > 0 ? `${overdueTasks} متأخرة` : "تحتاج إلى متابعة"
            }
            icon={ClipboardList}
            tone={overdueTasks > 0 ? "danger" : "warning"}
            state={tasksState}
            errorMessage={
              tasksQuery.error
                ? getApiErrorMessage(tasksQuery.error).title
                : undefined
            }
            onClick={() => setLocation("/tasks")}
          />
        </section>

        <div className="grid gap-5 xl:grid-cols-12 xl:gap-6">
          <SectionCard
            title="الملخص المالي"
            description="كانون الثاني 2025 — بناءً على الدفعات والمصروفات المسجلة"
            action={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/analytics")}
              >
                التحليلات
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>
            }
            className="xl:col-span-7"
          >
            {financeState === "error" ? (
              <ErrorState
                title="تعذر تحميل الملخص المالي"
                description={
                  financeErrorMessage ?? "حاول إعادة تحميل البيانات المالية."
                }
                className="py-8"
              />
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
                <FinancialValue
                  label="الإيرادات"
                  value={formatCurrency(dashboard.monthlyRevenue)}
                  state={financeState}
                  tone="info"
                  icon={HandCoins}
                />
                <FinancialValue
                  label="المصروفات"
                  value={formatCurrency(dashboard.totalExpenses)}
                  state={financeState}
                  tone="danger"
                  icon={CircleDollarSign}
                />
                <FinancialValue
                  label="صافي الربح"
                  value={formatCurrency(dashboard.currentPerformance.netProfit)}
                  state={financeState}
                  tone={
                    dashboard.currentPerformance.netProfit < 0
                      ? "danger"
                      : "positive"
                  }
                  icon={
                    dashboard.currentPerformance.netProfit <
                    dashboard.previousPerformance.netProfit
                      ? TrendingDown
                      : TrendingUp
                  }
                />
                <FinancialValue
                  label="الأرصدة المستحقة"
                  value={formatCurrency(dashboard.pendingBalance)}
                  state={financeState}
                  tone="warning"
                  icon={FileWarning}
                />
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="حالة الأسطول"
            description="توفر المركبات وحالتها الحالية"
            action={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/vehicles")}
              >
                عرض المركبات
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>
            }
            className="xl:col-span-5"
          >
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <FleetStatus
                label="متاحة"
                value={dashboard.availableCount}
                status="AVAILABLE"
              />
              <FleetStatus
                label="مؤجرة"
                value={dashboard.rentedCount}
                status="RENTED"
              />
              <FleetStatus
                label="في الصيانة"
                value={dashboard.vehiclesUnderMaintenance}
                status="MAINTENANCE"
                state={fleetState}
              />
              {fleetState === "ready" && dashboard.outOfServiceCount > 0 && (
                <FleetStatus
                  label="خارج الخدمة"
                  value={dashboard.outOfServiceCount}
                  status="OUT_OF_SERVICE"
                />
              )}
            </div>
            <div className="mt-5 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setLocation("/maintenance")}
                className="flex w-full items-center justify-between text-start"
              >
                <span>
                  <span className="block text-sm font-semibold text-foreground">
                    سجلات الصيانة
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    المواعيد والسجل التشغيلي
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="number-ltr text-lg font-bold text-status-warning">
                    {maintenanceState === "ready"
                      ? dashboard.maintenanceCount
                      : "—"}
                  </span>
                  <ChevronLeft
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </span>
              </button>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-5 xl:grid-cols-12 xl:gap-6">
          <SectionCard
            title="الإيجارات النشطة"
            description={`${dashboard.activeRentals.length} عقود قيد التنفيذ`}
            action={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/rentals")}
              >
                عرض الكل
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>
            }
            className="overflow-hidden xl:col-span-7"
          >
            {dashboard.activeRentals.length === 0 ? (
              <InfoBanner icon={CheckCircle2}>
                لا توجد إيجارات نشطة حالياً.
              </InfoBanner>
            ) : (
              <div className="-mx-4 -my-4 divide-y divide-border sm:-mx-5">
                {dashboard.activeRentals.slice(0, 4).map((rental) => (
                  <ActiveRentalRow
                    key={rental.id}
                    rental={rental}
                    vehicle={getVehicleById(rental.vehicleIds[0])}
                    customerName={getCustomerById(rental.customerId)?.name}
                    onClick={() => setLocation(`/rentals/${rental.id}`)}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="المهام والصيانة"
            description="التذكيرات القادمة والمتأخرة"
            action={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/tasks")}
              >
                المهام
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>
            }
            className="overflow-hidden xl:col-span-5"
          >
            {tasksState === "loading" || maintenanceState === "loading" ? (
              <LoadingState rows={3} className="-m-1 p-1" />
            ) : tasksState === "error" || maintenanceState === "error" ? (
              <ErrorState
                title="تعذر تحميل التذكيرات"
                description={
                  getApiErrorMessage(tasksQuery.error ?? maintenanceQuery.error)
                    .title
                }
                onRetry={() => {
                  void Promise.all([
                    tasksQuery.refetch(),
                    maintenanceQuery.refetch(),
                  ]);
                }}
                className="py-8"
              />
            ) : dashboard.upcomingMaintenance.length === 0 &&
              pendingTasks === 0 ? (
              <InfoBanner icon={CheckCircle2}>
                لا توجد مهام أو مواعيد صيانة قريبة.
              </InfoBanner>
            ) : (
              <div className="-mx-4 -my-4 divide-y divide-border sm:-mx-5">
                {dashboard.upcomingMaintenance.slice(0, 2).map((record) => {
                  const vehicle = realVehicleById.get(record.vehicleId);
                  const label =
                    MAINTENANCE_TYPES[record.type]?.label ?? record.type;
                  return (
                    <DashboardAlertRow
                      key={record.id}
                      icon={Wrench}
                      tone={
                        dueLabelFor(daysFromToday(record.maintenanceDate)).tone
                      }
                      title={`موعد ${label}`}
                      description={
                        vehicle
                          ? `${vehicle.make} ${vehicle.model} · ${formatDate(record.maintenanceDate)}`
                          : formatDate(record.maintenanceDate)
                      }
                      onClick={() => setLocation("/maintenance")}
                    />
                  );
                })}
                {pendingTasks > 0 && (
                  <DashboardAlertRow
                    icon={ClipboardList}
                    tone={overdueTasks > 0 ? "danger" : "warning"}
                    title={`${pendingTasks} مهام قيد الانتظار`}
                    description={
                      overdueTasks > 0
                        ? `${overdueTasks} مهام متأخرة`
                        : "راجع المهام المستحقة"
                    }
                    onClick={() => setLocation("/tasks")}
                  />
                )}
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard
          title="النشاط الأخير"
          description="آخر العقود التي تم إنهاؤها"
          action={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/rentals")}
            >
              سجل الإيجارات
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
          }
          className="overflow-hidden"
        >
          {dashboard.recentActivity.length === 0 ? (
            <InfoBanner icon={Clock3}>لا يوجد نشاط حديث لعرضه.</InfoBanner>
          ) : (
            <div className="-mx-4 -my-4 divide-y divide-border sm:-mx-5">
              {dashboard.recentActivity.map((rental) => (
                <RecentActivityRow
                  key={rental.id}
                  rental={rental}
                  vehicle={getVehicleById(rental.vehicleIds[0])}
                  customerName={getCustomerById(rental.customerId)?.name}
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function FinancialValue({
  label,
  value,
  state,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  state: DashboardMetricState;
  tone: "info" | "positive" | "warning" | "danger";
  icon: typeof HandCoins;
}) {
  const colorClass = {
    info: "text-status-info",
    positive: "text-status-positive",
    warning: "text-status-warning",
    danger: "text-status-danger",
  }[tone];

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon
          className={cn("size-4 shrink-0", colorClass)}
          aria-hidden="true"
        />
        <span className="text-xs font-medium">{label}</span>
      </div>
      {state === "loading" ? (
        <div
          className="mt-3 h-7 w-24 animate-pulse rounded-md bg-muted"
          aria-label={`جارٍ تحميل ${label}`}
        />
      ) : (
        <p
          className={cn(
            "number-ltr mt-3 truncate text-lg font-bold",
            colorClass,
          )}
        >
          {value}
        </p>
      )}
    </div>
  );
}

function FleetStatus({
  label,
  value,
  status,
  state = "ready",
}: {
  label: string;
  value: number;
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE" | "OUT_OF_SERVICE";
  state?: DashboardMetricState;
}) {
  return (
    <div>
      <StatusBadge status={status} label={label} />
      <p className="number-ltr mt-2 text-xl font-bold text-foreground">
        {state === "ready" ? value : "—"}
      </p>
    </div>
  );
}
