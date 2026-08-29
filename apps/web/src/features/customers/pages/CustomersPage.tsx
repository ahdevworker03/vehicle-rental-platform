import { useState } from "react";
import { useLocation, useSearchParams } from "wouter";
import { Plus, Users } from "lucide-react";
import { useCustomersList } from "@/features/customers/api-hooks";

import { CustomersDataList, CustomersDataListSkeleton } from "@/features/customers/components/CustomersDataList";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/FeedbackState";
import { SearchBar } from "@/components/ui/SearchBar";
import { SectionCard } from "@/components/ui/SectionCard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthProvider";

export default function CustomersPage() {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const customersQuery = useCustomersList(debouncedSearch ? { search: debouncedSearch } : undefined);
  const { customers } = customersQuery;
  const countLabel = `${customers.length} ${customers.length === 1 ? "عميل" : "عملاء"}`;

  return (
    <div className="min-h-full">
      <PageHeader
        title="العملاء"
        action={isOwner ? <Button type="button" onClick={() => setLocation("/customers/add")}><Plus className="size-4" aria-hidden="true" />إضافة عميل</Button> : undefined}
      />

      <div className="space-y-4 px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        <SectionCard title="قائمة العملاء" description="ابحث عن المستأجرين وراجع بيانات الهوية والرخصة بسرعة." className="shadow-none">
          <SearchBar placeholder="ابحث بالاسم أو الهوية أو رقم الرخصة أو الهاتف..." value={search} onChange={(event) => { const value = event.target.value; setSearch(value); setSearchParams(value ? { search: value } : {}, { replace: true }); }} onClear={() => { setSearch(""); setSearchParams({}, { replace: true }); }} />
        </SectionCard>

        {customersQuery.isLoading ? (
          <SectionCard className="overflow-hidden p-0 shadow-none"><CustomersDataListSkeleton /></SectionCard>
        ) : customersQuery.isError ? (
          <SectionCard className="shadow-none"><ErrorState title="تعذر تحميل العملاء" description={getApiErrorMessage(customersQuery.error).title} onRetry={() => void customersQuery.refetch()} /></SectionCard>
        ) : customers.length === 0 ? (
          <SectionCard className="shadow-none">
            <EmptyState
              icon={Users}
              title={search ? "لا توجد نتائج مطابقة" : "لا يوجد عملاء بعد"}
              description={search ? "جرّب اسماً أو رقماً مختلفاً." : isOwner ? "أضف أول عميل لبدء إدارة بيانات المستأجرين." : "لا يوجد عملاء في هذه المنظمة حالياً."}
              action={isOwner && !search ? { label: "إضافة عميل", onClick: () => setLocation("/customers/add") } : undefined}
            />
          </SectionCard>
        ) : (
          <SectionCard title="العملاء" action={<span className="text-xs font-medium text-muted-foreground">{countLabel}</span>} className="overflow-hidden p-0 shadow-none">
            <CustomersDataList customers={customers} onOpen={(customerId) => setLocation(`/customers/${customerId}`)} />
          </SectionCard>
        )}
      </div>
    </div>
  );
}
