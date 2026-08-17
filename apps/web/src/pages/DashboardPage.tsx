import { useMemo } from "react";
import { useLocation } from "wouter";
import {
  Car,
  Wrench,
  Plus,
  ChevronLeft,
  AlertTriangle,
  Clock,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { MAINTENANCE_TYPES, VEHICLE_STATUS_LABELS } from "@/lib/labels";
import { formatCurrency, formatDateShort } from "@/lib/format";
import { daysFromToday } from "@/lib/mock-date";
import { cn } from "@/lib/utils";
import { useVehicles, useVehicleById } from "@/features/vehicles/hooks";
import { useRentals } from "@/features/rentals/hooks";
import { useMaintenance } from "@/features/maintenance/hooks";
import { useExpenses } from "@/features/expenses/hooks";
import { getExpenseTotal } from "@/features/expenses/selectors";
import { useCustomerById } from "@/features/customers/hooks";
import { getVehicleStatusCounts } from "@/features/vehicles/selectors";
import {
  getRentalsEndingSoon,
  getRecentEndedRentals,
} from "@/features/rentals/selectors";
import {
  getOverdueMaintenance,
  getUpcomingMaintenance,
  getMaintenanceCount,
} from "@/features/maintenance/selectors";
import { usePayments, useOrgOutstandingBalances } from "@/features/payments/hooks";
import { getPaymentRevenueForPeriod } from "@/features/payments/selectors";
import { useTasks } from "@/features/tasks/hooks";
import { getPendingTaskCount, isTaskOverdue } from "@/features/tasks/selectors";
import { getApiErrorMessage } from "@/lib/api-error";
import { useListVehicles } from "@workspace/api-client-react";
import type { MaintenanceResponse, ExpenseResponse, PaymentResponse, TaskResponse } from "@workspace/api-client-react";

// ─── Mock date anchor ──────────────────────────────────────────────────────────
const MOCK_MONTH = 0; // January
const MOCK_YEAR = 2025;

// ─── Helpers ───────────────────────────────────────────────────────────────────
function dueLabelFor(days: number): { text: string; urgent: boolean } {
  if (days < 0) return { text: `متأخر ${Math.abs(days)} يوم`, urgent: true };
  if (days === 0) return { text: "اليوم", urgent: true };
  if (days === 1) return { text: "غداً", urgent: true };
  return { text: `بعد ${days} أيام`, urgent: false };
}

function relativeTimeLabel(pastDays: number): string {
  if (pastDays === 0) return "اليوم";
  if (pastDays === 1) return "أمس";
  if (pastDays === 2) return "منذ يومين";
  return `منذ ${pastDays} أيام`;
}

// ─── Derived data (computed per render from the feature hooks) ──────────────────
function deriveDashboard(
  vehicles: ReturnType<typeof useVehicles>,
  rentals: ReturnType<typeof useRentals>,
  maintenance: MaintenanceResponse[],
  realVehicles: Array<{ id: string; status: string }>,
  expenses: ExpenseResponse[],
  payments: PaymentResponse[],
  outstandingBalance: number,
) {
  const {
    available: availableCount,
    rented: rentedCount,
  } = getVehicleStatusCounts(vehicles);

  const maintenanceCount = getMaintenanceCount(maintenance);
  const vehiclesUnderMaintenance = realVehicles.filter(
    (v) => v.status === "MAINTENANCE",
  ).length;

  const totalExpenses = getExpenseTotal(expenses);
  const endingSoonRentals = getRentalsEndingSoon(rentals, daysFromToday);
  const overdueItems = getOverdueMaintenance(maintenance);
  const upcomingMaintenance = getUpcomingMaintenance(maintenance, daysFromToday, 7);
  const monthlyRevenue = getPaymentRevenueForPeriod(payments, MOCK_MONTH, MOCK_YEAR);
  const pendingBalance = outstandingBalance;
  const recentActivity = getRecentEndedRentals(rentals, 4);
  const hasTasks = endingSoonRentals.length > 0 || overdueItems.length > 0;

  return {
    availableCount,
    rentedCount,
    maintenanceCount,
    vehiclesUnderMaintenance,
    totalExpenses,
    endingSoonRentals,
    overdueItems,
    upcomingMaintenance,
    monthlyRevenue,
    pendingBalance,
    recentActivity,
    hasTasks,
  };
}

// ─── Local sub-components ──────────────────────────────────────────────────────

function TaskCard({
  children,
  onClick,
  urgent,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  urgent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-right bg-card rounded-xl p-4 border shadow-sm flex items-start gap-3",
        urgent ? "border-[hsl(var(--status-danger-bg))]" : "border-card-border",
        onClick && "cursor-pointer active:scale-[0.99] transition-transform"
      )}
    >
      {children}
    </button>
  );
}

function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  primary,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl p-4 min-h-[88px] w-full transition-transform active:scale-95",
        primary
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-card border border-card-border text-foreground shadow-sm"
      )}
    >
      <Icon className="w-6 h-6" strokeWidth={1.75} />
      <span className="text-sm font-semibold leading-tight text-center">
        {label}
      </span>
    </button>
  );
}

function RevenueCard({
  onClick,
  monthlyRevenue,
  pendingBalance,
  isLoading,
  error,
}: {
  onClick: () => void;
  monthlyRevenue: number;
  pendingBalance: number;
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-full flex flex-col text-right bg-primary rounded-2xl p-5 cursor-pointer active:scale-[0.99] transition-transform shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-primary-foreground/80">
          <TrendingUp className="w-4 h-4" strokeWidth={2} />
            <span className="text-sm font-medium">دخل كانون الثاني 2025</span>
        </div>
        <ChevronLeft className="w-4 h-4 text-primary-foreground/60" strokeWidth={2} />
      </div>
      {isLoading ? (
        <div className="text-sm text-primary-foreground/70 font-medium py-3">
          جارٍ تحميل البيانات المالية...
        </div>
      ) : error ? (
        <div className="text-sm text-primary-foreground/90 font-medium py-3">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-primary-foreground leading-tight">
              {formatCurrency(monthlyRevenue)}
            </div>
            <div className="text-xs text-primary-foreground/70 mt-1 font-medium">
              إجمالي الدخل
            </div>
          </div>
          <div className="border-r border-primary-foreground/20 pr-4">
            <div className="text-2xl font-bold text-primary-foreground/90 leading-tight">
              {formatCurrency(pendingBalance)}
            </div>
            <div className="text-xs text-primary-foreground/70 mt-1 font-medium">
              رصيد متبقي
            </div>
          </div>
        </div>
      )}
    </button>
  );
}

function ActivityRow({
  rentalId,
  rentals,
  getVehicleById,
  getCustomerById,
}: {
  rentalId: string;
  rentals: ReturnType<typeof useRentals>;
  getVehicleById: (id: string) => import("@/data/types").Vehicle | undefined;
  getCustomerById: (id: string) => import("@/data/types").Customer | undefined;
}) {
  const rental = rentals.find((r) => r.id === rentalId);
  if (!rental) return null;
  const vehicle = getVehicleById(rental.vehicleIds[0]);
  const customer = getCustomerById(rental.customerId);
  if (!vehicle || !customer) return null;

  const returnDays = Math.abs(daysFromToday(rental.returnDate!));
  const relativeTime = relativeTimeLabel(returnDays);

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="w-9 h-9 rounded-full bg-[hsl(var(--status-available-bg))] flex items-center justify-center flex-shrink-0 mt-0.5">
        <CheckCircle2
          className="w-5 h-5 text-[hsl(var(--status-available))]"
          strokeWidth={1.75}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-foreground">
          تم إنهاء عقد
        </div>
        <div className="text-sm text-muted-foreground mt-0.5">
          {vehicle.make} {vehicle.model}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          العميل: {customer.name} · {relativeTime}
        </div>
      </div>
      <div className="text-sm font-bold text-foreground flex-shrink-0 mt-0.5 whitespace-nowrap">
        {formatCurrency(rental.totalAmount)}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const vehicles = useVehicles();
  const rentals = useRentals();
  const maintenanceQuery = useMaintenance();
  const maintenance = maintenanceQuery.data?.data ?? [];
  const { data: realVehiclesData } = useListVehicles();
  const realVehicles = realVehiclesData?.data ?? [];
  const expensesQuery = useExpenses();
  const expenses = expensesQuery.data?.data ?? [];
  const paymentsQuery = usePayments();
  const payments = paymentsQuery.payments;
  const outstandingQuery = useOrgOutstandingBalances();
  const getVehicleById = useVehicleById();
  const getCustomerById = useCustomerById();

  const realVehicleById = useMemo(() => {
    const map = new Map<string, { make: string; model: string; plateNumber: string }>();
    realVehicles.forEach((v) => map.set(v.id, v));
    return map;
  }, [realVehicles]);

  const financialLoading = paymentsQuery.isLoading || outstandingQuery.isLoading;
  const financialError =
    paymentsQuery.error || outstandingQuery.error
      ? getApiErrorMessage(paymentsQuery.error ?? outstandingQuery.error).title
      : null;

  const tasksQuery = useTasks();
  const tasks = (tasksQuery.data?.data ?? []) as TaskResponse[];
  const pendingTasks = getPendingTaskCount(tasks);
  const overdueTasks = tasks.filter((t) => isTaskOverdue(t)).length;
  const tasksLoading = tasksQuery.isLoading;
  const tasksError = tasksQuery.error
    ? getApiErrorMessage(tasksQuery.error).title
    : null;

  const {
    availableCount,
    rentedCount,
    maintenanceCount,
    vehiclesUnderMaintenance,
    totalExpenses,
    endingSoonRentals,
    overdueItems,
    upcomingMaintenance,
    monthlyRevenue,
    pendingBalance,
    recentActivity,
    hasTasks,
  } = deriveDashboard(
    vehicles,
    rentals,
    maintenance,
    realVehicles,
    expenses,
    payments,
    outstandingQuery.totalOutstanding ?? 0,
  );

  return (
    <div className="min-h-full">
      <PageHeader title="الرئيسية" />

      <div className="px-4 space-y-5 lg:space-y-6">

        {/* ── Fleet Status + Revenue ────────────────────────────────────── */}
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        <section>
          <SectionHeader
            title="حالة السيارات"
            action={
              <button onClick={() => setLocation("/vehicles")} className="flex items-center gap-1">
                عرض الكل
                <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            }
          />
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label={VEHICLE_STATUS_LABELS.available}
              value={availableCount}
              variant="available"
              onClick={() => setLocation("/vehicles?filter=available")}
            />
            <StatCard
              label={VEHICLE_STATUS_LABELS.rented}
              value={rentedCount}
              variant="rented"
              onClick={() => setLocation("/vehicles?filter=rented")}
            />
            <StatCard
              label={VEHICLE_STATUS_LABELS.maintenance}
              value={vehiclesUnderMaintenance}
              variant="maintenance"
              onClick={() => setLocation("/vehicles?filter=maintenance")}
            />
          </div>

          {/* Maintenance records count → Maintenance view */}
          <button
            onClick={() => setLocation("/maintenance")}
            className="w-full mt-3 flex items-center justify-between rounded-xl border border-card-border bg-card px-4 py-2.5 text-right active:scale-[0.99] transition-transform"
          >
            <span className="text-sm font-semibold text-foreground">
              سجلات الصيانة
            </span>
            <span className="flex items-center gap-2">
              <span className="text-sm font-bold text-[hsl(var(--status-maintenance))] tabular-nums">
                {maintenanceCount}
              </span>
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.5} />
            </span>
          </button>

          {/* Expense overview → Expenses view */}
          <button
            onClick={() => setLocation("/expenses")}
            className="w-full mt-3 flex items-center justify-between rounded-xl border border-card-border bg-card px-4 py-2.5 text-right active:scale-[0.99] transition-transform"
          >
            <span className="text-sm font-semibold text-foreground">
              إجمالي المصروفات
            </span>
            <span className="flex items-center gap-2">
              <span className="text-sm font-bold text-[hsl(var(--status-danger))] tabular-nums">
                {formatCurrency(totalExpenses)}
              </span>
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.5} />
            </span>
          </button>

          {/* Tasks overview → Tasks view */}
          <button
            onClick={() => setLocation("/tasks")}
            className="w-full mt-3 flex items-center justify-between rounded-xl border border-card-border bg-card px-4 py-2.5 text-right active:scale-[0.99] transition-transform"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ClipboardList className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
              المهام
              {overdueTasks > 0 && !tasksLoading && !tasksError && (
                <span className="text-xs font-bold text-[hsl(var(--status-danger))]">
                  {overdueTasks} متأخرة
                </span>
              )}
            </span>
            <span className="flex items-center gap-2">
              <span
                className={
                  overdueTasks > 0 && !tasksLoading && !tasksError
                    ? "text-sm font-bold text-[hsl(var(--status-danger))] tabular-nums"
                    : "text-sm font-bold text-[hsl(var(--status-maintenance))] tabular-nums"
                }
              >
                {tasksLoading
                  ? "جارٍ التحميل..."
                  : tasksError
                    ? tasksError
                    : pendingTasks}
              </span>
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.5} />
            </span>
          </button>
        </section>

        {/* ── Revenue ───────────────────────────────────────────────────── */}
        <section>
          <RevenueCard
            onClick={() => setLocation("/analytics")}
            monthlyRevenue={monthlyRevenue}
            pendingBalance={pendingBalance}
            isLoading={financialLoading}
            error={financialError}
          />
        </section>
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <section>
          <SectionHeader title="الإجراءات الأساسية" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <QuickActionButton
              icon={Car}
              label="تأجير سيارة"
              onClick={() => setLocation("/rentals/new")}
              primary
            />
            <QuickActionButton
              icon={RotateCcw}
              label="إعادة سيارة"
              onClick={() => setLocation("/rentals")}
            />
            <QuickActionButton
              icon={Plus}
              label="إضافة سيارة"
              onClick={() => setLocation("/vehicles/add")}
            />
            <QuickActionButton
              icon={Wrench}
              label="تسجيل صيانة"
              onClick={() => setLocation("/maintenance/add")}
            />
          </div>
        </section>

        {/* ── Today's Tasks + Upcoming Maintenance ─────────────────────── */}
        <div className="grid gap-5 lg:gap-6 lg:grid-cols-2 lg:items-start">

        {/* ── Today's Tasks ─────────────────────────────────────────────── */}
        <section>
          <SectionHeader title="مهام اليوم" />
          {!hasTasks ? (
            <EmptyState
              icon={CheckCircle2}
              title="لا توجد مهام اليوم"
              description="لا توجد إيجارات منتهية أو صيانة متأخرة"
              className="py-8"
            />
          ) : (
            <div className="space-y-2">
              {/* Rentals ending soon */}
              {endingSoonRentals.map((rental) => {
                const vehicle = getVehicleById(rental.vehicleIds[0]);
                const customer = getCustomerById(rental.customerId);
                const days = daysFromToday(rental.endDate);
                const due = dueLabelFor(days);
                if (!vehicle || !customer) return null;

                return (
                  <TaskCard
                    key={rental.id}
                    urgent={due.urgent}
                    onClick={() => setLocation(`/rentals/${rental.id}`)}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                        due.urgent
                          ? "bg-[hsl(var(--status-danger-bg))]"
                          : "bg-[hsl(var(--status-rented-bg))]"
                      )}
                    >
                      <Clock
                        className={cn(
                          "w-5 h-5",
                          due.urgent
                            ? "text-[hsl(var(--status-danger))]"
                            : "text-[hsl(var(--status-rented))]"
                        )}
                        strokeWidth={1.75}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground">
                        إعادة السيارة {due.text}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {vehicle.make} {vehicle.model}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        العميل: {customer.name}
                      </div>
                    </div>
                  </TaskCard>
                );
              })}

              {/* Overdue maintenance */}
              {overdueItems.map((item) => {
                const vehicle = realVehicleById.get(item.vehicleId);
                if (!vehicle) return null;
                const days = daysFromToday(item.maintenanceDate);
                const due = dueLabelFor(days);
                const typeLabel = MAINTENANCE_TYPES[item.type]?.label ?? item.type;

                return (
                  <TaskCard
                    key={item.id}
                    urgent
                    onClick={() => setLocation("/maintenance")}
                  >
                    <div className="w-9 h-9 rounded-full bg-[hsl(var(--status-danger-bg))] flex items-center justify-center flex-shrink-0 mt-1">
                      <AlertTriangle
                        className="w-5 h-5 text-[hsl(var(--status-danger))]"
                        strokeWidth={1.75}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground">
                        {`موعد ${typeLabel} (${due.text})`}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {vehicle.make} {vehicle.model}
                      </div>
                    </div>
                  </TaskCard>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Upcoming Maintenance ──────────────────────────────────────── */}
        {upcomingMaintenance.length > 0 && (
          <section>
            <SectionHeader
              title="الصيانة القادمة"
              action={
                <button onClick={() => setLocation("/maintenance")} className="flex items-center gap-1">
                  عرض الكل
                  <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              }
            />
            <div className="space-y-2">
              {upcomingMaintenance.map((item) => {
                const vehicle = realVehicleById.get(item.vehicleId);
                if (!vehicle) return null;
                const days = daysFromToday(item.maintenanceDate);
                const due = dueLabelFor(days);
                const typeLabel = MAINTENANCE_TYPES[item.type]?.label ?? item.type;

                return (
                  <TaskCard
                    key={item.id}
                    urgent={due.urgent}
                    onClick={() => setLocation("/maintenance")}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                      due.urgent
                        ? "bg-[hsl(var(--status-danger-bg))]"
                        : "bg-[hsl(var(--status-maintenance-bg))]"
                    )}>
                      <Wrench
                        className={cn(
                          "w-5 h-5",
                          due.urgent
                            ? "text-[hsl(var(--status-danger))]"
                            : "text-[hsl(var(--status-maintenance))]"
                        )}
                        strokeWidth={1.75}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground">
                        {`موعد ${typeLabel} ${due.text}`}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {vehicle.make} {vehicle.model}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatDateShort(item.maintenanceDate)}
                      </div>
                    </div>
                  </TaskCard>
                );
              })}
            </div>
          </section>
        )}

        </div>

        {/* ── Recent Activity ───────────────────────────────────────────── */}
        <section>
          <SectionHeader
            title="النشاط الأخير"
            action={
              <button onClick={() => setLocation("/rentals")} className="flex items-center gap-1">
                عرض الكل
                <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            }
          />
          {recentActivity.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="لا يوجد نشاط حديث"
              description="سيظهر هنا النشاط عند بدء التعامل"
              className="py-8"
            />
          ) : (
            <div className="bg-card rounded-xl border border-card-border shadow-sm px-4">
              {recentActivity.map((rental) => (
                <ActivityRow
                  key={rental.id}
                  rentalId={rental.id}
                  rentals={rentals}
                  getVehicleById={getVehicleById}
                  getCustomerById={getCustomerById}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
