import { useLocation } from "wouter";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

import { formatCurrency } from "@/lib/format";
import { VEHICLE_STATUS_LABELS } from "@/lib/labels";

import { useVehicles, useVehicleById } from "@/features/vehicles/hooks";
import { useRentals } from "@/features/rentals/hooks";
import { useCustomers, useCustomerById } from "@/features/customers/hooks";
import {
  getVehicleStatusCounts,
  getVehiclesByStatus,
} from "@/features/vehicles/selectors";
import {
  getActiveRentals,
  getEndedRentals,
  getMonthlyRevenue,
  getPendingBalance,
  getVehicleRevenueForMonth,
  getCustomerBalances,
} from "@/features/rentals/selectors";

// ─── Mock date anchor ─────────────────────────────────────────────────────────
const MOCK_MONTH = 0;   // January
const MOCK_YEAR  = 2025;
const PREV_MONTH = 11;  // December
const PREV_YEAR  = 2024;

// ─── Derived data (computed per render from the feature hooks) ──────────────────
function deriveAnalytics(
  vehicles: ReturnType<typeof useVehicles>,
  rentals: ReturnType<typeof useRentals>,
  customers: ReturnType<typeof useCustomers>,
  getVehicleById: (id: string) => import("@/data/types").Vehicle | undefined,
  getCustomerById: (id: string) => import("@/data/types").Customer | undefined
) {
  const thisMonthRevenue = getMonthlyRevenue(rentals, MOCK_MONTH, MOCK_YEAR);
  const prevMonthRevenue = getMonthlyRevenue(rentals, PREV_MONTH, PREV_YEAR);
  const vehicleRevenueThisMonth = getVehicleRevenueForMonth(rentals, MOCK_MONTH, MOCK_YEAR);

  const revenueChange =
    prevMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
      : null;
  const revenueUp = revenueChange !== null && revenueChange >= 0;

  const totalPending = getPendingBalance(rentals);
  const activeRentals = getActiveRentals(rentals);

  const vehicleRevenueList = Object.entries(vehicleRevenueThisMonth)
    .map(([vid, amount]) => ({ vehicle: getVehicleById(vid)!, amount }))
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

  const customerBalance = getCustomerBalances(rentals);
  const topDebtorEntry = Object.entries(customerBalance).sort((a, b) => b[1] - a[1])[0];
  const topDebtor = topDebtorEntry
    ? { customer: getCustomerById(topDebtorEntry[0])!, balance: topDebtorEntry[1] }
    : null;

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
    endedCount,
    topDebtor,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [, navigate] = useLocation();
  const vehicles = useVehicles();
  const rentals = useRentals();
  const customers = useCustomers();
  const getVehicleById = useVehicleById();
  const getCustomerById = useCustomerById();

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
    endedCount,
    topDebtor,
  } = deriveAnalytics(vehicles, rentals, customers, getVehicleById, getCustomerById);

  return (
    <div className="min-h-full">
      <PageHeader title="التحليلات" showBack />

      <div className="px-4 pt-4 pb-8 space-y-6">

        {/* ── Top row: Revenue + Revenue by vehicle ─────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">

        {/* ── Section 1: Revenue ─────────────────────────────────────────── */}
        <section>
          <SectionHeader title="الإيرادات" />

          {/* Main revenue card */}
          <div className="rounded-2xl bg-primary p-5 text-white mb-3">
            <p className="text-sm font-medium opacity-80 mb-1">إيرادات كانون الثاني 2025</p>
            <p className="text-3xl font-bold tracking-tight">{formatCurrency(thisMonthRevenue)}</p>

            {revenueChange !== null && (
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
            <span className="text-sm font-bold text-[hsl(var(--status-danger))]">
              {formatCurrency(totalPending)}
            </span>
          </div>
        </section>

        {/* ── Section 2: Revenue by vehicle ─────────────────────────────── */}
        <section>
          <SectionHeader title="إيرادات السيارات هذا الشهر" />

          {vehicleRevenueList.length === 0 ? (
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
