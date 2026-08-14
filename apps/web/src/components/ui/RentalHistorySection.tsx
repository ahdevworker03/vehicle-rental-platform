import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { FileText, History } from "lucide-react";

import { RentalCard } from "@/components/ui/RentalCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/spinner";
import { SearchBar } from "@/components/ui/SearchBar";
import { getApiErrorMessage } from "@/lib/api-error";
import { useListCustomers, useListVehicles } from "@workspace/api-client-react";
import type { RentalResponse } from "@workspace/api-client-react";

interface RentalHistorySectionProps {
  rentals: RentalResponse[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  title: string;
  emptyMessage: string;
}

export function RentalHistorySection({
  rentals,
  isLoading,
  isError,
  error,
  title,
  emptyMessage,
}: RentalHistorySectionProps) {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const { data: customersData } = useListCustomers();
  const { data: vehiclesData } = useListVehicles();

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rentals;
    return rentals.filter((r) => {
      const customer = customerById.get(r.customerId);
      const vehicle = vehicleById.get(r.vehicleId);
      const customerName = customer ? `${customer.firstName} ${customer.lastName}`.toLowerCase() : "";
      const vehicleName = vehicle ? `${vehicle.make} ${vehicle.model}`.toLowerCase() : "";
      return customerName.includes(q) || vehicleName.includes(q);
    });
  }, [rentals, search, customerById, vehicleById]);

  return (
    <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-2">
        <History className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
      </div>

      <SearchBar
        placeholder="ابحث..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClear={() => setSearch("")}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner />
        </div>
      ) : isError ? (
        <div className="text-sm text-muted-foreground text-center py-4">
          {error ? getApiErrorMessage(error).title : "حدث خطأ في تحميل سجل الإيجارات"}
        </div>
      ) : filtered.length === 0 ? (
        search ? (
          <EmptyState
            icon={FileText}
            title="لا توجد نتائج"
            description="جرّب كلمة بحث مختلفة"
            className="py-8"
          />
        ) : (
          <EmptyState
            icon={FileText}
            title={emptyMessage}
            description="ستظهر الإيجارات هنا عند إنشائها"
            className="py-8"
          />
        )
      ) : (
        <div className="space-y-2">
          {filtered.map((rental) => {
            const customer = customerById.get(rental.customerId);
            const vehicle = vehicleById.get(rental.vehicleId);
            return (
              <RentalCard
                key={rental.id}
                rental={rental}
                customerName={customer ? `${customer.firstName} ${customer.lastName}` : "—"}
                vehicleName={vehicle ? `${vehicle.make} ${vehicle.model}` : "—"}
                vehiclePlate={vehicle?.plateNumber ?? ""}
                onClick={() => setLocation(`/rentals/${rental.id}`)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
