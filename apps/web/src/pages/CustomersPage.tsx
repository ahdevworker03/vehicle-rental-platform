import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { CustomerCard } from "@/components/ui/CustomerCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/spinner";
import { useListCustomers } from "@workspace/api-client-react";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthProvider";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function CustomersPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const { data, isLoading, isError, error } = useListCustomers(
    debouncedSearch ? { search: debouncedSearch } : undefined,
  );

  const customers = useMemo(() => data?.data ?? [], [data]);

  return (
    <div className="min-h-full">
      <PageHeader
        title="العملاء"
        action={
          isOwner ? (
            <button
              onClick={() => setLocation("/customers/add")}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-95 transition-transform"
              aria-label="إضافة عميل"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          ) : undefined
        }
      />

      <div className="px-4 pt-4 pb-3">
        <SearchBar
          placeholder="ابحث بالاسم أو الهوية أو رقم الرخصة أو الهاتف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
        />
        {search && customers.length > 0 && (
          <p className="text-xs text-muted-foreground text-right mt-2">
            عرض {customers.length} نتيجة بحث
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
            icon={Users}
            title="حدث خطأ"
            description={getApiErrorMessage(error).title}
            className="py-16"
          />
        ) : customers.length === 0 ? (
          search ? (
            <EmptyState
              icon={Users}
              title="لا توجد نتائج"
              description="جرّب اسماً أو رقماً مختلف"
              className="py-16"
            />
          ) : (
            <EmptyState
              icon={Users}
              title="لا يوجد عملاء بعد"
              description="أضف أول عميل للبدء"
              action={
                isOwner
                  ? {
                      label: "إضافة عميل",
                      onClick: () => setLocation("/customers/add"),
                    }
                  : undefined
              }
              className="py-16"
            />
          )
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {customers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onClick={() => setLocation(`/customers/${customer.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
