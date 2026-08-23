import { useMemo, useState } from "react";
import { useLocation, useSearchParams } from "wouter";
import { Car, Plus } from "lucide-react";
import type { VehicleResponseStatus } from "@workspace/api-client-react";
import { useListVehicles } from "@workspace/api-client-react";
import { VehiclesDataList, VehiclesDataListSkeleton } from "@/components/vehicles/VehiclesDataList";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/FeedbackState";
import { FilterChips } from "@/components/ui/FilterChips";
import { SearchBar } from "@/components/ui/SearchBar";
import { SectionCard } from "@/components/ui/SectionCard";
import { VehicleAvailabilitySection } from "@/components/ui/VehicleAvailabilitySection";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/api-error";
import { VEHICLE_STATUS_FILTER_OPTIONS } from "@/lib/vehicle-labels";
import { useAuth } from "@/providers/AuthProvider";

type FilterValue = "all" | VehicleResponseStatus;

export default function VehiclesPage() {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const isOwner = user?.role === "OWNER";
  const filter = (searchParams.get("filter") as FilterValue) || "all";

  const vehiclesQuery = useListVehicles(debouncedSearch ? { search: debouncedSearch } : undefined);
  const vehicles = useMemo(() => vehiclesQuery.data?.data ?? [], [vehiclesQuery.data]);
  const filteredVehicles = useMemo(
    () => filter === "all" ? vehicles : vehicles.filter((vehicle) => vehicle.status === filter),
    [filter, vehicles],
  );

  const countLabel = `${filteredVehicles.length} ${filteredVehicles.length === 1 ? "مركبة" : "مركبات"}`;

  return (
    <div className="min-h-full">
      <PageHeader
        title="المركبات"
        action={isOwner ? <Button type="button" onClick={() => setLocation("/vehicles/add")}><Plus className="size-4" aria-hidden="true" />إضافة مركبة</Button> : undefined}
      />

      <div className="space-y-4 px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        <SectionCard title="أسطول المركبات" description="ابحث عن المركبات وتابع حالتها وبياناتها التشغيلية." className="shadow-none">
          <div className="space-y-3">
            <SearchBar placeholder="ابحث بالاسم أو رقم اللوحة أو سنة الصنع..." value={search} onChange={(event) => setSearch(event.target.value)} onClear={() => setSearch("")} />
            <FilterChips
              options={VEHICLE_STATUS_FILTER_OPTIONS}
              value={filter}
              onChange={(value) => {
                const nextFilter = value as FilterValue;
                setSearchParams(nextFilter === "all" ? {} : { filter: nextFilter }, { replace: true });
              }}
              className="-mb-1 [&_button]:px-3 [&_button]:text-xs"
            />
          </div>
        </SectionCard>

        {vehiclesQuery.isLoading ? (
          <SectionCard className="overflow-hidden p-0 shadow-none"><VehiclesDataListSkeleton /></SectionCard>
        ) : vehiclesQuery.isError ? (
          <SectionCard className="shadow-none"><ErrorState title="تعذر تحميل المركبات" description={getApiErrorMessage(vehiclesQuery.error).title} onRetry={() => void vehiclesQuery.refetch()} /></SectionCard>
        ) : filteredVehicles.length === 0 ? (
          <SectionCard className="shadow-none">
            <EmptyState
              icon={Car}
              title={search || filter !== "all" ? "لا توجد نتائج مطابقة" : "لا توجد مركبات بعد"}
              description={search || filter !== "all" ? "جرّب تغيير كلمة البحث أو إزالة بعض عوامل التصفية." : isOwner ? "أضف أول مركبة لبدء إدارة الأسطول." : "لا توجد مركبات في هذه المنظمة حالياً."}
              action={isOwner && !search && filter === "all" ? { label: "إضافة مركبة", onClick: () => setLocation("/vehicles/add") } : undefined}
            />
          </SectionCard>
        ) : (
          <SectionCard title="المركبات" action={<span className="text-xs font-medium text-muted-foreground">{countLabel}</span>} className="overflow-hidden p-0 shadow-none">
            <VehiclesDataList vehicles={filteredVehicles} onOpen={(vehicleId) => setLocation(`/vehicles/${vehicleId}`)} />
          </SectionCard>
        )}

        <div className="max-w-4xl">
          <VehicleAvailabilitySection />
        </div>
      </div>
    </div>
  );
}
