import { useMemo, useState } from "react";
import { useLocation, useSearchParams } from "wouter";
import { AlertTriangle, ClipboardList, Plus } from "lucide-react";

import { TasksDataList, TasksDataListSkeleton } from "@/features/tasks/components/TasksDataList";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/FeedbackState";
import { FilterChips } from "@/components/ui/FilterChips";
import { SearchBar } from "@/components/ui/SearchBar";
import { SectionCard } from "@/components/ui/SectionCard";
import { useTasks } from "@/features/tasks/hooks";
import { filterTasks, getPendingTaskCount, isTaskOverdue, type TaskStatusFilter } from "@/features/tasks/selectors";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthProvider";

const FILTER_OPTIONS = [
  { label: "الكل", value: "all" },
  { label: "قيد الانتظار", value: "pending" },
  { label: "مكتملة", value: "completed" },
];

export default function TasksPage() {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const filter = (searchParams.get("filter") as TaskStatusFilter) || "all";
  const tasksQuery = useTasks();
  const tasks = useMemo(() => tasksQuery.data?.data ?? [], [tasksQuery.data]);
  const filtered = useMemo(() => filterTasks(tasks, filter, debouncedSearch).filter((task) => !overdueOnly || isTaskOverdue(task)), [tasks, filter, debouncedSearch, overdueOnly]);
  const pendingCount = getPendingTaskCount(tasks);
  const overdueCount = useMemo(() => tasks.filter((task) => isTaskOverdue(task)).length, [tasks]);
  const countLabel = `${filtered.length} ${filtered.length === 1 ? "مهمة" : "مهام"}`;

  return (
    <div className="min-h-full">
      <PageHeader title="المهام" action={isOwner ? <Button type="button" onClick={() => setLocation("/tasks/add")}><Plus className="size-4" aria-hidden="true" />إضافة مهمة</Button> : undefined} />

      <div className="space-y-4 px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        {overdueCount > 0 && <button type="button" onClick={() => { setSearchParams({ filter: "pending" }, { replace: true }); setOverdueOnly(true); }} className="flex w-full items-center justify-between gap-3 rounded-xl border border-status-danger/25 bg-status-danger-bg px-4 py-3 text-start text-sm text-status-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"><span className="font-semibold">لديك {overdueCount} {overdueCount === 1 ? "مهمة متأخرة" : "مهام متأخرة"} تحتاج إلى متابعة.</span><span className="shrink-0 font-semibold underline">عرض المهمة المتأخرة</span></button>}

        <SectionCard title="قائمة المهام" description="تابع المواعيد والاستحقاقات وأكمل المهام من سجلها.">
          <div className="space-y-3">
            <SearchBar placeholder="ابحث في المهام..." value={search} onChange={(event) => setSearch(event.target.value)} onClear={() => setSearch("")} />
            <div className="flex flex-wrap items-center justify-between gap-3"><FilterChips options={FILTER_OPTIONS} value={filter} onChange={(value) => { const next = value as TaskStatusFilter; setOverdueOnly(false); setSearchParams(next === "all" ? {} : { filter: next }, { replace: true }); }} className="-mb-1 flex-wrap overflow-visible sm:flex-nowrap sm:overflow-x-auto [&_button]:px-3 [&_button]:text-xs" />{pendingCount > 0 && <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground"><AlertTriangle className="size-3.5 text-status-warning" aria-hidden="true" />{pendingCount} {pendingCount === 1 ? "مهمة معلّقة" : "مهام معلّقة"}</span>}</div>
          </div>
        </SectionCard>

        {tasksQuery.isLoading ? (
          <SectionCard className="overflow-hidden p-0 shadow-none"><TasksDataListSkeleton /></SectionCard>
        ) : tasksQuery.isError ? (
          <SectionCard className="shadow-none"><ErrorState title="تعذر تحميل المهام" description={getApiErrorMessage(tasksQuery.error).title} onRetry={() => void tasksQuery.refetch()} /></SectionCard>
        ) : filtered.length === 0 ? (
          <SectionCard className="shadow-none"><EmptyState icon={ClipboardList} title={search || filter !== "all" ? "لا توجد نتائج مطابقة" : "لا توجد مهام"} description={search || filter !== "all" ? "جرّب تغيير كلمة البحث أو إزالة بعض عوامل التصفية." : isOwner ? "أضف أول مهمة لبدء متابعة الأعمال اليومية." : "لا توجد مهام في هذه المنظمة حالياً."} action={isOwner && !search && filter === "all" ? { label: "إضافة مهمة", onClick: () => setLocation("/tasks/add") } : undefined} /></SectionCard>
        ) : (
          <SectionCard title="المهام" action={<span className="text-xs font-medium text-muted-foreground">{countLabel}</span>} className="overflow-hidden p-0 shadow-none"><TasksDataList tasks={filtered} onOpen={(taskId) => setLocation(`/tasks/${taskId}`)} /></SectionCard>
        )}
      </div>
    </div>
  );
}
