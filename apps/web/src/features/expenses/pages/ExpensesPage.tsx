import { useState, useMemo } from "react";
import { useLocation, useSearchParams } from "wouter";
import { Plus, Wallet } from "lucide-react";

import { ExpensesDataList, ExpensesDataListSkeleton } from "@/features/expenses/components/ExpensesDataList";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/FeedbackState";
import { FilterChips } from "@/components/ui/FilterChips";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionCard } from "@/components/ui/SectionCard";
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

  const { data, isLoading, isError, error, refetch } = useExpenses();
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
  const items = useMemo(
    () => filtered.map((expense) => {
      const vehicle = expense.vehicleId ? vehicleById.get(expense.vehicleId) : null;
      return {
        expense,
        vehicleName: vehicle ? `${vehicle.make} ${vehicle.model}` : "",
        vehiclePlate: vehicle?.plateNumber ?? "",
      };
    }),
    [filtered, vehicleById],
  );
  const countLabel = `${items.length} ${items.length === 1 ? "مصروف" : "مصروفات"}`;

  return (
    <div className="min-h-full">
      <PageHeader
        title="المصروفات"
        action={
          isOwner ? (
            <Button type="button" onClick={() => setLocation("/expenses/add")}>
              <Plus className="size-4" aria-hidden="true" />
              تسجيل مصروف
            </Button>
          ) : undefined
        }
      />

      <div className="space-y-4 px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        <SectionCard title="سجل المصروفات" description="تابع مصروفات المنظمة والمركبات حسب الفئة والتاريخ." className="shadow-none">
          <div className="space-y-3">
            <SearchBar placeholder="ابحث بالمركبة أو الفئة أو الوصف..." value={search} onChange={(event) => setSearch(event.target.value)} onClear={() => setSearch("")} />
            <FilterChips
              options={EXPENSE_CATEGORY_FILTER_OPTIONS}
              value={filter}
              onChange={(value) => {
                const next = value as FilterValue;
                setSearchParams(next === "all" ? {} : { filter: next }, { replace: true });
              }}
              className="-mb-1 flex-wrap overflow-visible sm:flex-nowrap sm:overflow-x-auto [&_button]:px-3 [&_button]:text-xs"
            />
          </div>
        </SectionCard>

        {isLoading ? (
          <SectionCard className="overflow-hidden p-0 shadow-none"><ExpensesDataListSkeleton /></SectionCard>
        ) : isError ? (
          <SectionCard className="shadow-none"><ErrorState title="تعذر تحميل المصروفات" description={error ? getApiErrorMessage(error).title : "تحقق من الاتصال ثم أعد المحاولة."} onRetry={() => void refetch()} /></SectionCard>
        ) : items.length === 0 ? (
          search || filter !== "all" ? (
            <SectionCard className="shadow-none"><EmptyState icon={Wallet} title="لا توجد نتائج مطابقة" description="جرّب تغيير كلمة البحث أو إزالة بعض عوامل التصفية." /></SectionCard>
          ) : (
            <SectionCard className="shadow-none"><EmptyState icon={Wallet} title="لا توجد مصروفات" description={isOwner ? "سجّل أول مصروف لبدء متابعة تكاليف المنظمة والمركبات." : "لا توجد مصروفات في هذه المنظمة حالياً."} action={isOwner ? { label: "تسجيل مصروف", onClick: () => setLocation("/expenses/add") } : undefined} /></SectionCard>
          )
        ) : (
          <SectionCard title="المصروفات" action={<span className="text-xs font-medium text-muted-foreground">{countLabel}</span>} className="overflow-hidden p-0 shadow-none"><ExpensesDataList items={items} onOpen={(expenseId) => setLocation(`/expenses/${expenseId}`)} /></SectionCard>
        )}
      </div>
    </div>
  );
}
