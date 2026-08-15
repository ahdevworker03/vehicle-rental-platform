import { useState } from "react";
import { useLocation, useSearchParams } from "wouter";
import { Plus, Wrench, CheckCircle } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { FilterChips } from "@/components/ui/FilterChips";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { MaintenanceCard } from "@/components/ui/MaintenanceCard";
import { MAINTENANCE_TYPES } from "@/lib/labels";

import { MOCK_TODAY } from "@/lib/mock-date";
import { useTimeout } from "@/hooks/useTimeout";
import { useMaintenance } from "@/features/maintenance/hooks";
import { useVehicle } from "@/features/vehicles/hooks";
import { getOverdueCount } from "@/features/maintenance/selectors";
import type { MaintenanceRecord } from "@/data/types";

type FilterValue = "all" | "overdue" | "upcoming" | "completed";

const FILTER_OPTIONS = [
  { label: "الكل",    value: "all"       },
  { label: "متأخرة", value: "overdue"   },
  { label: "قادمة",  value: "upcoming"  },
  { label: "مكتملة", value: "completed" },
];

function sortRecords(records: MaintenanceRecord[]): MaintenanceRecord[] {
  const ORDER: Record<string, number> = { overdue: 0, upcoming: 1, completed: 2 };
  return [...records].sort((a, b) => {
    const statusDiff = (ORDER[a.status] ?? 3) - (ORDER[b.status] ?? 3);
    if (statusDiff !== 0) return statusDiff;
    if (a.status === "completed") {
      return new Date(b.completedDate ?? b.dueDate).getTime() -
             new Date(a.completedDate ?? a.dueDate).getTime();
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

export default function MaintenancePage() {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const maintenance = useMaintenance();
  const getVehicleById = useVehicle;
  const [records, setRecords] = useState<MaintenanceRecord[]>(() => [...maintenance]);
  const filter = (searchParams.get("filter") as FilterValue) || "all";
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Auto-clear the success banner, cleaned up on unmount
  useTimeout(() => setSuccessMsg(""), successMsg ? 2500 : null);

  // ── Derived list ──────────────────────────────────────────────────────────
  const filtered = sortRecords(
    records.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      const v = getVehicleById(r.vehicleId);
      const vehicleStr = v ? `${v.make} ${v.model} ${v.plate}`.toLowerCase() : "";
      return vehicleStr.includes(q) || MAINTENANCE_TYPES[r.type]?.label.includes(q);
    })
  );

  const overdueCount  = getOverdueCount(records);

  // ── Mark complete ─────────────────────────────────────────────────────────
  function handleMarkComplete(id: string) {
    const updated: MaintenanceRecord = {
      ...records.find((r) => r.id === id)!,
      status: "completed",
      completedDate: MOCK_TODAY.toISOString(),
    };
    setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
    const idx = maintenance.findIndex((r) => r.id === id);
    if (idx !== -1) maintenance[idx] = updated;

    setExpandedId(null);
    setSuccessMsg("تم تسجيل الإنجاز");
  }

  function handleToggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="min-h-full">
      <PageHeader
        title="الصيانة"
        action={
          <button
            onClick={() => setLocation("/maintenance/add")}
            aria-label="تسجيل صيانة جديدة"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </button>
        }
      />

      <div className="px-4 pt-4 pb-2 space-y-3">
        {/* Alert strip — overdue items */}
        {overdueCount > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[hsl(var(--status-danger-bg))] border border-[hsl(var(--status-danger))]/20">
            <button
              onClick={() => setSearchParams({ filter: "overdue" }, { replace: true })}
              className="text-xs font-bold text-[hsl(var(--status-danger))] underline"
            >
              عرض المتأخرة
            </button>
            <span className="text-sm font-bold text-[hsl(var(--status-danger))]">
              {overdueCount} {overdueCount === 1 ? "سيارة متأخرة" : "سيارات متأخرة"}
            </span>
          </div>
        )}

        <FilterChips
          options={FILTER_OPTIONS}
          value={filter}
          onChange={(v) => {
            const val = v as FilterValue;
            if (val === "all") {
              setSearchParams({}, { replace: true });
            } else {
              setSearchParams({ filter: val }, { replace: true });
            }
          }}
        />

        <SearchBar
          placeholder="ابحث بالسيارة أو نوع الصيانة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
        />
      </div>

      {/* Success toast — consistent with RentalDetailPage */}
      {successMsg && (
        <div className="mx-4 mt-1 px-4 py-3 rounded-xl bg-[hsl(var(--status-available-bg))] text-[hsl(var(--status-available))] text-sm font-semibold flex items-center gap-2 justify-end">
          <span>{successMsg}</span>
          <CheckCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
        </div>
      )}

      <div className="px-4 pb-6 mt-3">
        {(search || filter !== "all") && filtered.length > 0 && (
          <p className="text-xs text-muted-foreground text-right px-1 mb-3">
            عرض {filtered.length} من أصل {records.length} سجل
          </p>
        )}

        {filtered.length === 0 ? (
          search ? (
            <EmptyState
              icon={Wrench}
              title="لا توجد نتائج"
              description="جرّب تغيير كلمة البحث أو إزالة بعض الفلاتر"
              className="py-16"
            />
          ) : (
            <EmptyState
              icon={Wrench}
              title={
                filter === "overdue"
                  ? "لا توجد صيانة متأخرة"
                  : filter === "upcoming"
                  ? "لا توجد صيانة قادمة"
                  : filter === "completed"
                  ? "لم يتم تسجيل أي صيانة مكتملة بعد"
                  : "لا توجد سجلات صيانة"
              }
              description={
                filter === "all" || filter === "upcoming"
                  ? "اضغط + لتسجيل صيانة جديدة"
                  : undefined
              }
              action={
                filter === "all" || filter === "upcoming"
                  ? {
                      label: "تسجيل صيانة",
                      onClick: () => setLocation("/maintenance/add"),
                    }
                  : undefined
              }
            />
          )
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:items-start">
            {filtered.map((record) => {
              const vehicle = getVehicleById(record.vehicleId);
              return (
                <MaintenanceCard
                  key={record.id}
                  record={record}
                  vehicleName={vehicle ? `${vehicle.make} ${vehicle.model}` : "—"}
                  vehiclePlate={vehicle?.plate ?? ""}
                  isExpanded={expandedId === record.id}
                  onToggle={() => handleToggle(record.id)}
                  onMarkComplete={() => handleMarkComplete(record.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
