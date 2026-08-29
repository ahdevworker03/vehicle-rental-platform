import { useMemo, useState } from "react";
import { useLocation, useSearchParams } from "wouter";
import { Plus, Wrench } from "lucide-react";
import type { MaintenanceResponse } from "@workspace/api-client-react";
import { useListVehicles } from "@workspace/api-client-react";

import { MaintenanceDataList, MaintenanceDataListSkeleton } from "@/features/maintenance/components/MaintenanceDataList";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/FeedbackState";
import { FilterChips } from "@/components/ui/FilterChips";
import { SearchBar } from "@/components/ui/SearchBar";
import { SectionCard } from "@/components/ui/SectionCard";
import { useMaintenance, useMaintenanceSchedules } from "@/features/maintenance/hooks";
import { getDisplayStatus, getOverdueCount } from "@/features/maintenance/selectors";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/api-error";
import { MAINTENANCE_TYPES } from "@/lib/labels";
import { useAuth } from "@/providers/AuthProvider";

type FilterValue = "all" | "scheduled" | "in_progress" | "completed" | "overdue" | "upcoming";

const FILTER_OPTIONS = [
  { label: "الكل", value: "all" },
  { label: "مجدولة", value: "scheduled" },
  { label: "قيد التنفيذ", value: "in_progress" },
  { label: "مكتملة", value: "completed" },
  { label: "متأخرة", value: "overdue" },
  { label: "قادمة", value: "upcoming" },
];

function matchesFilter(record: MaintenanceResponse, filter: FilterValue): boolean {
  if (filter === "all") return true;
  if (filter === "overdue" || filter === "upcoming") return getDisplayStatus(record) === filter;
  return record.status === filter.toUpperCase();
}

export default function MaintenancePage() {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const filter = (searchParams.get("filter") as FilterValue) || "all";
  const maintenanceQuery = useMaintenance();
  const schedulesQuery = useMaintenanceSchedules();
  const vehiclesQuery = useListVehicles();
  const records = useMemo(() => maintenanceQuery.data?.data ?? [], [maintenanceQuery.data]);
  const vehiclesById = useMemo(() => {
    const map = new Map<string, { make: string; model: string; plateNumber: string }>();
    (vehiclesQuery.data?.data ?? []).forEach((vehicle) => map.set(vehicle.id, vehicle));
    return map;
  }, [vehiclesQuery.data]);
  const filtered = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return records.filter((record) => {
      if (!matchesFilter(record, filter)) return false;
      if (!query) return true;
      const vehicle = vehiclesById.get(record.vehicleId);
      return `${vehicle?.make ?? ""} ${vehicle?.model ?? ""} ${vehicle?.plateNumber ?? ""} ${MAINTENANCE_TYPES[record.type].label}`.toLowerCase().includes(query);
    });
  }, [debouncedSearch, filter, records, vehiclesById]);
  const items = useMemo(() => filtered.map((record) => {
    const vehicle = vehiclesById.get(record.vehicleId);
    return { record, vehicleName: vehicle ? `${vehicle.make} ${vehicle.model}` : "—", vehiclePlate: vehicle?.plateNumber ?? "" };
  }), [filtered, vehiclesById]);
  const overdueCount = getOverdueCount(records);
  const countLabel = `${items.length} ${items.length === 1 ? "سجل" : "سجلات"}`;

  return (
    <div className="min-h-full">
      <PageHeader title="الصيانة" action={isOwner ? <Button type="button" onClick={() => setLocation("/maintenance/add")}><Plus className="size-4" aria-hidden="true" />تسجيل صيانة</Button> : undefined} />

      <div className="space-y-4 px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        {overdueCount > 0 && (
          <button type="button" onClick={() => setSearchParams({ filter: "overdue" }, { replace: true })} className="flex w-full items-center justify-between gap-3 rounded-xl border border-status-danger/25 bg-status-danger-bg px-4 py-3 text-start text-sm text-status-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
            <span className="font-semibold">لديك {overdueCount} {overdueCount === 1 ? "صيانة متأخرة" : "سجلات صيانة متأخرة"} تحتاج إلى متابعة.</span>
            <span className="shrink-0 font-semibold underline">عرض المتأخرة</span>
          </button>
        )}

        <SectionCard title="سجل الصيانة" description="تابع المواعيد وحالة الأعمال وتكاليف الصيانة." className="shadow-none">
          <div className="space-y-3">
            <SearchBar placeholder="ابحث بالمركبة أو نوع الصيانة..." value={search} onChange={(event) => setSearch(event.target.value)} onClear={() => setSearch("")} />
            <FilterChips options={FILTER_OPTIONS} value={filter} onChange={(value) => { const next = value as FilterValue; setSearchParams(next === "all" ? {} : { filter: next }, { replace: true }); }} className="-mb-1 flex-wrap overflow-visible sm:flex-nowrap sm:overflow-x-auto [&_button]:px-3 [&_button]:text-xs" />
          </div>
        </SectionCard>

        {maintenanceQuery.isLoading ? (
          <SectionCard className="overflow-hidden p-0 shadow-none"><MaintenanceDataListSkeleton /></SectionCard>
        ) : maintenanceQuery.isError ? (
          <SectionCard className="shadow-none"><ErrorState title="تعذر تحميل سجلات الصيانة" description={getApiErrorMessage(maintenanceQuery.error).title} onRetry={() => void maintenanceQuery.refetch()} /></SectionCard>
        ) : items.length === 0 ? (
          <SectionCard className="shadow-none"><EmptyState icon={Wrench} title={search || filter !== "all" ? "لا توجد نتائج مطابقة" : "لا توجد سجلات صيانة"} description={search || filter !== "all" ? "جرّب تغيير كلمة البحث أو إزالة بعض عوامل التصفية." : isOwner ? "سجّل أول عملية صيانة لبدء متابعة أعمال الأسطول." : "لا توجد سجلات صيانة في هذه المنظمة حالياً."} action={isOwner && !search && filter === "all" ? { label: "تسجيل صيانة", onClick: () => setLocation("/maintenance/add") } : undefined} /></SectionCard>
        ) : (
          <SectionCard title="السجلات" action={<span className="text-xs font-medium text-muted-foreground">{countLabel}</span>} className="overflow-hidden p-0 shadow-none"><MaintenanceDataList items={items} onOpen={(maintenanceId) => setLocation(`/maintenance/${maintenanceId}`)} /></SectionCard>
        )}

        <SectionCard title="جداول الصيانة" description="قواعد مواعيد الخدمة المستقبلية. لا تنشئ سجلات صيانة تلقائياً." className="shadow-none">
          {schedulesQuery.isLoading ? <MaintenanceDataListSkeleton /> : schedulesQuery.isError ? <ErrorState title="تعذر تحميل جداول الصيانة" description={getApiErrorMessage(schedulesQuery.error).title} onRetry={() => void schedulesQuery.refetch()} /> : (schedulesQuery.data?.data ?? []).length === 0 ? <p className="text-sm text-muted-foreground">لا توجد جداول صيانة مضافة.</p> : <div className="divide-y divide-border">{(schedulesQuery.data?.data ?? []).map((schedule) => { const vehicle = vehiclesById.get(schedule.vehicleId); const basis = schedule.scheduleType === "DATE" ? `كل ${schedule.dateIntervalDays ?? "—"} يوم` : schedule.scheduleType === "MILEAGE" ? `كل ${schedule.mileageInterval ?? "—"} كم` : `تاريخ أو ${schedule.mileageInterval ?? "—"} كم`; return <div key={schedule.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div className="min-w-0"><div className="text-sm font-semibold text-foreground">{MAINTENANCE_TYPES[schedule.maintenanceType].label}</div><div dir="ltr" className="mt-1 text-xs text-muted-foreground">{vehicle ? `${vehicle.make} ${vehicle.model} · ${vehicle.plateNumber}` : "مركبة غير متاحة"}</div></div><div className="text-end text-xs text-muted-foreground"><div>{basis}</div><div className="mt-1">{schedule.isActive ? "مفعّل" : "متوقف"}</div></div></div>; })}</div>}
        </SectionCard>
      </div>
    </div>
  );
}
