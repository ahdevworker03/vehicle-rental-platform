import { useState, useMemo } from "react";
import { useLocation, useSearchParams } from "wouter";
import { Plus, ClipboardList, AlertCircle } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { FilterChips } from "@/components/ui/FilterChips";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/spinner";
import { TaskCard } from "@/components/ui/TaskCard";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthProvider";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useTasks } from "@/features/tasks/hooks";
import { filterTasks, getPendingTaskCount, type TaskStatusFilter } from "@/features/tasks/selectors";

const FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "الكل", value: "all" },
  { label: "قيد الانتظار", value: "pending" },
  { label: "مكتملة", value: "completed" },
];

export default function TasksPage() {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const isOwner = user?.role === "OWNER";
  const filter = (searchParams.get("filter") as TaskStatusFilter) || "all";

  const { data, isLoading, isError, error } = useTasks();

  const tasks = useMemo(() => data?.data ?? [], [data]);

  const filtered = useMemo(
    () => filterTasks(tasks, filter, debouncedSearch),
    [tasks, filter, debouncedSearch],
  );

  const pendingCount = getPendingTaskCount(tasks);

  return (
    <div className="min-h-full">
      <PageHeader
        title="المهام"
        action={
          isOwner ? (
            <button
              onClick={() => setLocation("/tasks/add")}
              aria-label="إضافة مهمة"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm active:scale-95 transition-transform"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          ) : undefined
        }
      />

      <div className="px-4 pt-4 pb-2 space-y-3">
        {pendingCount > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[hsl(var(--status-maintenance-bg))] border border-[hsl(var(--status-maintenance))]/20">
            <button
              onClick={() => setSearchParams({ filter: "pending" }, { replace: true })}
              className="text-xs font-bold text-[hsl(var(--status-maintenance))] underline"
            >
              عرض المهام المعلّقة
            </button>
            <span className="text-sm font-bold text-[hsl(var(--status-maintenance))]">
              {pendingCount} {pendingCount === 1 ? "مهمة معلّقة" : "مهام معلّقة"}
            </span>
          </div>
        )}

        <FilterChips
          options={FILTER_OPTIONS}
          value={filter}
          onChange={(v) => {
            const val = v as TaskStatusFilter;
            if (val === "all") {
              setSearchParams({}, { replace: true });
            } else {
              setSearchParams({ filter: val }, { replace: true });
            }
          }}
        />

        <SearchBar
          placeholder="ابحث في الملاحظات..."
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
            icon={AlertCircle}
            title="حدث خطأ"
            description={error ? getApiErrorMessage(error).title : "تعذر تحميل المهام"}
            className="py-16"
          />
        ) : filtered.length === 0 ? (
          search || filter !== "all" ? (
            <EmptyState
              icon={ClipboardList}
              title="لا توجد نتائج"
              description="جرّب تغيير كلمة البحث أو إزالة بعض الفلاتر"
              className="py-16"
            />
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="لا توجد مهام"
              description={isOwner ? "اضغط + لإضافة مهمة جديدة" : "لا توجد مهام في هذه المنظمة حالياً"}
              action={
                isOwner
                  ? {
                      label: "إضافة مهمة",
                      onClick: () => setLocation("/tasks/add"),
                    }
                  : undefined
              }
            />
          )
        ) : (
          <div className="space-y-2">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => setLocation(`/tasks/${task.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
