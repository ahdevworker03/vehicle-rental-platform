import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { FileText, Plus } from "lucide-react";
import {
  useListCustomers,
  useListRentals,
  useListVehicles,
} from "@workspace/api-client-react";
import {
  RentalsDataList,
  RentalsDataListSkeleton,
  type RentalListItem,
} from "@/features/rentals/components/RentalsDataList";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/FeedbackState";
import { FilterChips } from "@/components/ui/FilterChips";
import { SearchBar } from "@/components/ui/SearchBar";
import { SectionCard } from "@/components/ui/SectionCard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/api-error";
import { RENTAL_STATUS_FILTER_OPTIONS } from "@/lib/rental-labels";
import { usePayments } from "@/features/payments/hooks";
import { useAuth } from "@/providers/AuthProvider";

type RentalFilter = "all" | "RESERVED" | "ACTIVE" | "RETURNED" | "CANCELLED";

export default function RentalsPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RentalFilter>("all");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const rentalsQuery = useListRentals(
    debouncedSearch ? { search: debouncedSearch } : undefined,
  );
  const { data: customersData } = useListCustomers();
  const { data: vehiclesData } = useListVehicles();
  const paymentsQuery = usePayments();

  const rentals = useMemo(() => rentalsQuery.data?.data ?? [], [rentalsQuery.data]);

  const customerById = useMemo(() => {
    const map = new Map<string, { firstName: string; lastName: string; phone: string }>();
    (customersData?.data ?? []).forEach((customer) => map.set(customer.id, customer));
    return map;
  }, [customersData]);

  const vehicleById = useMemo(() => {
    const map = new Map<string, { make: string; model: string; plateNumber: string }>();
    (vehiclesData?.data ?? []).forEach((vehicle) => map.set(vehicle.id, vehicle));
    return map;
  }, [vehiclesData]);

  const paidAmountByRental = useMemo(() => {
    if (paymentsQuery.isLoading || paymentsQuery.isError) return null;

    return paymentsQuery.payments.reduce((amounts, payment) => {
      amounts.set(payment.rentalId, (amounts.get(payment.rentalId) ?? 0) + payment.amount);
      return amounts;
    }, new Map<string, number>());
  }, [paymentsQuery.isError, paymentsQuery.isLoading, paymentsQuery.payments]);

  const items = useMemo<RentalListItem[]>(() => {
    return rentals
      .filter((rental) => statusFilter === "all" || rental.status === statusFilter)
      .map((rental) => {
        const customer = customerById.get(rental.customerId);
        const vehicle = vehicleById.get(rental.vehicleId);
        const paidAmount = paidAmountByRental?.get(rental.id) ?? 0;

        return {
          rental,
          customerName: customer ? `${customer.firstName} ${customer.lastName}` : "—",
          customerPhone: customer?.phone,
          vehicleName: vehicle ? `${vehicle.make} ${vehicle.model}` : "—",
          vehiclePlate: vehicle?.plateNumber ?? "—",
          paidAmount: paidAmountByRental === null ? null : paidAmount,
          outstandingBalance:
            paidAmountByRental === null
              ? null
              : Math.max(0, rental.totalAmount - paidAmount),
        };
      });
  }, [customerById, paidAmountByRental, rentals, statusFilter, vehicleById]);

  const listCount = `${items.length} ${items.length === 1 ? "عقد" : "عقود"}`;

  return (
    <div className="min-h-full">
      <PageHeader
        title="الإيجارات"
        action={
          isOwner ? (
            <Button type="button" onClick={() => setLocation("/rentals/new")}>
              <Plus className="size-4" aria-hidden="true" />
              إنشاء إيجار
            </Button>
          ) : undefined
        }
      />

      <div className="space-y-4 px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        <SectionCard
          className="shadow-none"
          title="قائمة الإيجارات"
          description="تابع العقود الحالية والحجوزات وحالات الإرجاع."
        >
          <div className="space-y-3">
            <SearchBar
              placeholder="ابحث بالعميل أو المركبة..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onClear={() => setSearch("")}
            />
            <FilterChips
              options={RENTAL_STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as RentalFilter)}
              className="-mb-1 [&_button]:px-3 [&_button]:text-xs"
            />
          </div>
        </SectionCard>

        {rentalsQuery.isLoading ? (
          <SectionCard className="overflow-hidden p-0 shadow-none">
            <RentalsDataListSkeleton />
          </SectionCard>
        ) : rentalsQuery.isError ? (
          <SectionCard className="shadow-none">
            <ErrorState
              title="تعذر تحميل الإيجارات"
              description={getApiErrorMessage(rentalsQuery.error).title}
              onRetry={() => void rentalsQuery.refetch()}
            />
          </SectionCard>
        ) : items.length === 0 ? (
          <SectionCard className="shadow-none">
            <EmptyState
              icon={FileText}
              title={search || statusFilter !== "all" ? "لا توجد نتائج مطابقة" : "لا توجد إيجارات بعد"}
              description={
                search || statusFilter !== "all"
                  ? "جرّب تغيير كلمة البحث أو إزالة بعض عوامل التصفية."
                  : isOwner
                    ? "أنشئ أول عقد إيجار لبدء متابعة عمليات التأجير."
                    : "لا توجد إيجارات في هذه المنظمة حالياً."
              }
              action={
                isOwner && !search && statusFilter === "all"
                  ? { label: "إنشاء إيجار", onClick: () => setLocation("/rentals/new") }
                  : undefined
              }
            />
          </SectionCard>
        ) : (
          <SectionCard
            className="overflow-hidden p-0 shadow-none"
            title="العقود"
            action={<span className="text-xs font-medium text-muted-foreground">{listCount}</span>}
          >
            <RentalsDataList
              items={items}
              onOpen={(rentalId) => setLocation(`/rentals/${rentalId}`)}
            />
          </SectionCard>
        )}
      </div>
    </div>
  );
}
