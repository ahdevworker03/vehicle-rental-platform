import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/spinner";
import { useListCustomers } from "@workspace/api-client-react";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthProvider";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";
import { formatInitials } from "@/lib/format";

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

      <div className="px-4 pb-6 space-y-3">
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
          customers.map((customer) => {
            const fullName = `${customer.firstName} ${customer.lastName}`.trim();
            return (
              <div
                key={customer.id}
                onClick={() => setLocation(`/customers/${customer.id}`)}
                className={cn(
                  "bg-card rounded-2xl border border-card-border shadow-sm p-4 cursor-pointer active:scale-[0.99] transition-transform",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-base">
                    {formatInitials(fullName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground mb-0.5 truncate">
                      {fullName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {customer.phone}
                      {customer.address && (
                        <span className="before:content-['·'] before:mx-1.5">
                          {customer.address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
