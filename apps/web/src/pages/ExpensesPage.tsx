import { useState, useMemo } from "react";
import { useLocation, useSearchParams } from "wouter";
import { Plus, Wallet } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { FilterChips } from "@/components/ui/FilterChips";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/spinner";
import { ExpenseCard } from "@/components/ui/ExpenseCard";
import { EXPENSE_CATEGORY_LABELS, EXPENSE_CATEGORY_FILTER_OPTIONS } from "@/lib/labels";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthProvider";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useListVehicles } from "@workspace/api-client-react";
import { useExpenses } from "@/features/expenses/hooks";
import { filterExpenses, type ExpenseDisplayFilter } from "@/features/expenses/selectors";

type FilterValue = ExpenseDisplayFilter;

export default function ExpensesPage() {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const isOwner = user?.role === "OWNER";
  const filter = (searchParams.get("filter") as FilterValue) || "all";

  const { data, isLoading, isError, error } = useExpenses();
  const { data: vehiclesData } = useListVehicles();

  const expenses = useMemo(() => data?.data ?? [], [data]);

  const vehicleById = useMemo(() => {
    const map = new Map<string, { make: string; model: string; plateNumber: string }>();
    (vehiclesData?.data ?? []).forEach((v) => map.set(v.id, v));
    return map;
  }, [vehiclesData]);

  const filtered = useMemo(
    () =>
      filterExpenses(
        expenses,
        filter as ExpenseDisplayFilter,
        debouncedSearch,
        (e) => {
          const vehicle = e.vehicleId ? vehicleById.get(e.vehicleId) : null;
          return vehicle ? `${vehicle.make} ${vehicle.model} ${vehicle.plateNumber}` : "";
        },
        (category) => EXPENSE_CATEGORY_LABELS[category]?.label ?? category,
      ),
    [expenses, filter, debouncedSearch, vehicleById],
  );

  return (
    <div className="min-h-full">
      <PageHeader
        title="المصروفات"
        action={
          isOwner ? (
            <button
              onClick={() => setLocation("/expenses/add")}
              aria-label="تسجيل مصروف جديد"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm active:scale-95 transition-transform"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          ) : undefined
        }
      />

      <div className="px-4 pt-4 pb-2 space-y-3">
        <FilterChips
          options={EXPENSE_CATEGORY_FILTER_OPTIONS}
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
          placeholder="ابحث بالسيارة أو الفئة أو الوصف..."
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
            icon={Wallet}
            title="حدث خطأ"
            description={error ? getApiErrorMessage(error).title : "تعذر تحميل المصروفات"}
            className="py-16"
          />
        ) : filtered.length === 0 ? (
          search || filter !== "all" ? (
            <EmptyState
              icon={Wallet}
              title="لا توجد نتائج"
              description="جرّب تغيير كلمة البحث أو إزالة بعض الفلاتر"
              className="py-16"
            />
          ) : (
            <EmptyState
              icon={Wallet}
              title="لا توجد مصروفات"
              description={isOwner ? "اضغط + لتسجيل مصروف جديد" : "لا توجد مصروفات في هذه المنظمة حالياً"}
              action={
                isOwner
                  ? {
                      label: "تسجيل مصروف",
                      onClick: () => setLocation("/expenses/add"),
                    }
                  : undefined
              }
            />
          )
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((expense) => {
              const vehicle = expense.vehicleId ? vehicleById.get(expense.vehicleId) : null;
              return (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  vehicleName={vehicle ? `${vehicle.make} ${vehicle.model}` : ""}
                  vehiclePlate={vehicle?.plateNumber ?? ""}
                  onClick={() => setLocation(`/expenses/${expense.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
