import { useState, useMemo } from "react";
import { useLocation, useSearchParams } from "wouter";
import { Plus, Wrench } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { FilterChips } from "@/components/ui/FilterChips";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/spinner";
import { MaintenanceCard, type MaintenanceCardStatus } from "@/components/ui/MaintenanceCard";
import { MAINTENANCE_TYPES } from "@/lib/labels";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthProvider";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useListVehicles } from "@workspace/api-client-react";
import type { MaintenanceResponse } from "@workspace/api-client-react";
import { useMaintenance } from "@/features/maintenance/hooks";
import { getDisplayStatus, getOverdueCount } from "@/features/maintenance/selectors";

type FilterValue = "all" | "scheduled" | "in_progress" | "completed" | "overdue" | "upcoming";

const FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "الكل",        value: "all"         },
  { label: "مجدولة",      value: "scheduled"   },
  { label: "قيد التنفيذ", value: "in_progress" },
  { label: "مكتملة",      value: "completed"   },
  { label: "متأخرة",      value: "overdue"     },
  { label: "قادمة",       value: "upcoming"    },
];

function matchesFilter(record: MaintenanceResponse, filter: FilterValue): boolean {
  if (filter === "all") return true;
  if (filter === "overdue") return getDisplayStatus(record) === "overdue";
  if (filter === "upcoming") return getDisplayStatus(record) === "upcoming";
  return record.status === filter.toUpperCase();
}

export default function MaintenancePage() {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { user } = useAuth();
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const isOwner = user?.role === "OWNER";
  const filter = (searchParams.get("filter") as FilterValue) || "all";

  const { data, isLoading, isError, error } = useMaintenance();
  const { data: vehiclesData } = useListVehicles();

  const records = useMemo(() => data?.data ?? [], [data]);

  const vehicleById = useMemo(() => {
    const map = new Map<string, { make: string; model: string; plateNumber: string }>();
    (vehiclesData?.data ?? []).forEach((v) => map.set(v.id, v));
    return map;
  }, [vehiclesData]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return records
      .filter((r) => matchesFilter(r, filter))
      .filter((r) => {
        if (!q) return true;
        const vehicle = vehicleById.get(r.vehicleId);
        const vehicleStr = vehicle
          ? `${vehicle.make} ${vehicle.model} ${vehicle.plateNumber}`.toLowerCase()
          : "";
        return (
          vehicleStr.includes(q) ||
          MAINTENANCE_TYPES[r.type]?.label.toLowerCase().includes(q)
        );
      });
  }, [records, filter, debouncedSearch, vehicleById]);

  const overdueCount = getOverdueCount(records);

  function handleToggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="min-h-full">
      <PageHeader
        title="الصيانة"
        action={
          isOwner ? (
            <button
              onClick={() => setLocation("/maintenance/add")}
              aria-label="تسجيل صيانة جديدة"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm active:scale-95 transition-transform"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          ) : undefined
        }
      />

      <div className="px-4 pt-4 pb-2 space-y-3">
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

      <div className="px-4 pb-6 mt-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="size-6" />
          </div>
        ) : isError ? (
          <EmptyState
            icon={Wrench}
            title="حدث خطأ"
            description={error ? getApiErrorMessage(error).title : "تعذر تحميل سجلات الصيانة"}
            className="py-16"
          />
        ) : filtered.length === 0 ? (
          search || filter !== "all" ? (
            <EmptyState
              icon={Wrench}
              title="لا توجد نتائج"
              description="جرّب تغيير كلمة البحث أو إزالة بعض الفلاتر"
              className="py-16"
            />
          ) : (
            <EmptyState
              icon={Wrench}
              title="لا توجد سجلات صيانة"
              description={isOwner ? "اضغط + لتسجيل صيانة جديدة" : "لا توجد سجلات صيانة في هذه المنظمة حالياً"}
              action={
                isOwner
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
              const vehicle = vehicleById.get(record.vehicleId);
              const displayStatus: MaintenanceCardStatus = getDisplayStatus(record);
              return (
                <MaintenanceCard
                  key={record.id}
                  record={record}
                  displayStatus={displayStatus}
                  vehicleName={vehicle ? `${vehicle.make} ${vehicle.model}` : "—"}
                  vehiclePlate={vehicle?.plateNumber ?? ""}
                  isExpanded={expandedId === record.id}
                  onToggle={() => handleToggle(record.id)}
                  onMarkComplete={
                    isOwner && record.status !== "COMPLETED"
                      ? () => setLocation(`/maintenance/${record.id}`)
                      : undefined
                  }
                  onOpen={() => setLocation(`/maintenance/${record.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
