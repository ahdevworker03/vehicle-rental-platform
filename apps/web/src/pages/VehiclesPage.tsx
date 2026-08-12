import { useState, useMemo } from "react";
import { useLocation, useSearchParams } from "wouter";
import { Plus, Car } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { FilterChips } from "@/components/ui/FilterChips";
import { VehicleCard } from "@/components/ui/VehicleCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/spinner";
import { useListVehicles } from "@workspace/api-client-react";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthProvider";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { VEHICLE_STATUS_FILTER_OPTIONS } from "@/lib/vehicle-labels";
import type { VehicleResponseStatus } from "@workspace/api-client-react";

type FilterValue = "all" | VehicleResponseStatus;

export default function VehiclesPage() {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const isOwner = user?.role === "OWNER";
  const filter = (searchParams.get("filter") as FilterValue) || "all";

  const { data, isLoading, isError, error } = useListVehicles(
    debouncedSearch ? { search: debouncedSearch } : undefined,
  );

  const vehicles = useMemo(() => data?.data ?? [], [data]);

  const filtered = useMemo(() => {
    if (filter === "all") return vehicles;
    return vehicles.filter((v) => v.status === filter);
  }, [filter, vehicles]);

  return (
    <div className="min-h-full">
      <PageHeader
        title="السيارات"
        action={
          isOwner ? (
            <button
              onClick={() => setLocation("/vehicles/add")}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-95 transition-transform"
              aria-label="إضافة سيارة"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          ) : undefined
        }
      />

      <div className="px-4 pt-4 pb-4 space-y-3">
        <SearchBar
          placeholder="ابحث بالماركة أو الموديل أو رقم اللوحة أو السنة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
        />
        <FilterChips
          options={VEHICLE_STATUS_FILTER_OPTIONS}
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
        {(search || filter !== "all") && filtered.length > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            عرض {filtered.length} {search ? "نتيجة بحث" : "سيارة"}
          </p>
        )}
      </div>

      <div className="px-4 pb-6 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="size-6" />
          </div>
        ) : isError ? (
          <EmptyState
            icon={Car}
            title="حدث خطأ"
            description={getApiErrorMessage(error).title}
            className="py-16"
          />
        ) : filtered.length === 0 ? (
          search || filter !== "all" ? (
            <EmptyState
              icon={Car}
              title="لا توجد نتائج"
              description="جرّب تغيير كلمة البحث أو إزالة بعض الفلاتر"
              className="py-16"
            />
          ) : (
            <EmptyState
              icon={Car}
              title="لا توجد سيارات بعد"
              description={isOwner ? "أضف أول سيارة للبدء" : "لا توجد سيارات في هذه المنظمة حالياً"}
              action={
                isOwner
                  ? {
                      label: "إضافة سيارة",
                      onClick: () => setLocation("/vehicles/add"),
                    }
                  : undefined
              }
              className="py-16"
            />
          )
        ) : (
          filtered.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onClick={() => setLocation(`/vehicles/${vehicle.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
