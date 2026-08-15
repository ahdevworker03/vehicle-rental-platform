import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Plus, FileText } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { RentalCard } from "@/components/ui/RentalCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/spinner";

import {
  useListRentals,
  useListCustomers,
  useListVehicles,
} from "@workspace/api-client-react";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthProvider";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function RentalsPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const { data, isLoading, isError, error } = useListRentals(
    debouncedSearch ? { search: debouncedSearch } : undefined,
  );
  const { data: customersData } = useListCustomers();
  const { data: vehiclesData } = useListVehicles();

  const rentals = useMemo(() => data?.data ?? [], [data]);

  const customerById = useMemo(() => {
    const map = new Map<string, { firstName: string; lastName: string }>();
    (customersData?.data ?? []).forEach((c) => map.set(c.id, c));
    return map;
  }, [customersData]);

  const vehicleById = useMemo(() => {
    const map = new Map<string, { make: string; model: string; plateNumber: string }>();
    (vehiclesData?.data ?? []).forEach((v) => map.set(v.id, v));
    return map;
  }, [vehiclesData]);

  return (
    <div className="min-h-full">
      <PageHeader
        title="الإيجارات"
        action={
          isOwner ? (
            <button
              onClick={() => setLocation("/rentals/new")}
              aria-label="إيجار جديد"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm active:scale-95 transition-transform"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          ) : undefined
        }
      />

      <div className="px-4 pt-4 pb-2 space-y-3">
        <SearchBar
          placeholder="ابحث بالعميل أو السيارة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
        />
        {search && rentals.length > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            عرض {rentals.length} نتيجة بحث
          </p>
        )}
      </div>

      <div className="px-4 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="size-6" />
          </div>
        ) : isError ? (
          <EmptyState
            icon={FileText}
            title="حدث خطأ"
            description={getApiErrorMessage(error).title}
            className="py-16"
          />
        ) : rentals.length === 0 ? (
          search ? (
            <EmptyState
              icon={FileText}
              title="لا توجد نتائج"
              description="جرّب تغيير كلمة البحث"
              className="py-16"
            />
          ) : (
            <EmptyState
              icon={FileText}
              title="لا توجد إيجارات بعد"
              description={isOwner ? "اضغط على + لإنشاء إيجار جديد" : "لا توجد إيجارات في هذه المنظمة حالياً"}
              action={
                isOwner
                  ? {
                      label: "إيجار جديد",
                      onClick: () => setLocation("/rentals/new"),
                    }
                  : undefined
              }
              className="py-16"
            />
          )
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rentals.map((rental) => {
              const customer = customerById.get(rental.customerId);
              const vehicle = vehicleById.get(rental.vehicleId);
              return (
                <RentalCard
                  key={rental.id}
                  rental={rental}
                  customerName={
                    customer ? `${customer.firstName} ${customer.lastName}` : "—"
                  }
                  vehicleName={vehicle ? `${vehicle.make} ${vehicle.model}` : "—"}
                  vehiclePlate={vehicle?.plateNumber ?? ""}
                  onClick={() => setLocation(`/rentals/${rental.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
