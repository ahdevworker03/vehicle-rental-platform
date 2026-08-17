import { useState } from "react";
import { CheckCircle, AlertCircle, Calendar, StickyNote, Circle, ClipboardList } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { InfoRow } from "@/components/ui/InfoRow";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { formatDateAr } from "@/lib/format";
import { TASK_STATUS_LABELS } from "@/lib/labels";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthProvider";
import { useTask, useTaskMutations } from "@/features/tasks/hooks";
import { isTaskOverdue } from "@/features/tasks/selectors";
import type { TaskResponse } from "@workspace/api-client-react";

interface DetailPageParams {
  params: { id: string };
}

const statusBadgeClass: Record<TaskResponse["status"], string> = {
  PENDING: "bg-[hsl(var(--status-maintenance-bg))] text-[hsl(var(--status-maintenance))]",
  COMPLETED: "bg-[hsl(var(--status-available-bg))] text-[hsl(var(--status-available))]",
};

export default function TaskDetailPage({ params }: DetailPageParams) {
  const id = params.id;
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";

  const { data, isLoading, isError, error } = useTask(id);
  const mutations = useTaskMutations();

  const [confirming, setConfirming] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const task = data?.data;

  async function handleComplete() {
    if (!task) return;
    setActionError(null);

    try {
      await mutations.complete.mutateAsync({ id: task.id });
      setSuccessMsg("تم إكمال المهمة بنجاح");
      setConfirming(false);
    } catch (err) {
      setActionError(getApiErrorMessage(err).title);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="min-h-full">
        <PageHeader title="تفاصيل المهمة" showBack />
        <EmptyState
          icon={AlertCircle}
          title="لا توجد بيانات"
          description={error ? getApiErrorMessage(error).title : "لم يتم العثور على هذه المهمة"}
          className="py-16"
        />
      </div>
    );
  }

  const completed = task.status === "COMPLETED";
  const overdue = !completed && isTaskOverdue(task);
  const StatusIcon = completed ? CheckCircle : Circle;

  return (
    <div className="min-h-full pb-8">
      <PageHeader title="تفاصيل المهمة" showBack />

      {(successMsg || actionError) && (
        <div
          className={cn(
            "mx-4 mt-3 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 justify-end",
            actionError
              ? "bg-destructive/10 text-destructive border border-destructive/30"
              : "bg-[hsl(var(--status-available-bg))] text-[hsl(var(--status-available))]",
          )}
        >
          <span>{actionError ?? successMsg}</span>
          {actionError ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
          ) : (
            <CheckCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
          )}
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">
        {/* Header card */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-[hsl(var(--status-maintenance-bg))] flex items-center justify-center flex-shrink-0">
            <StatusIcon className="w-7 h-7 text-[hsl(var(--status-maintenance))]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-base font-bold text-foreground truncate">
                {task.notes ? task.notes : "مهمة بدون ملاحظات"}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold px-2.5 py-0.5 rounded-full",
                  statusBadgeClass[task.status],
                )}
              >
                {TASK_STATUS_LABELS[task.status] ?? task.status}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">{task.id.slice(0, 8)}</div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm px-4 py-2">
          <InfoRow
            label="الحالة"
            value={
              <span className={cn("text-sm font-semibold", completed ? "text-[hsl(var(--status-available))]" : "text-[hsl(var(--status-maintenance))]")}>
                {TASK_STATUS_LABELS[task.status] ?? task.status}
              </span>
            }
          />
          <InfoRow
            label="تاريخ الاستحقاق"
            value={
              <span className="flex items-center gap-1.5">
                {formatDateAr(task.dueDate)}
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
              </span>
            }
          />
          {overdue && (
            <InfoRow
              label="متأخرة"
              value={
                <span className="text-sm font-semibold text-[hsl(var(--status-danger))]">
                  تجاوز تاريخ الاستحقاق
                </span>
              }
            />
          )}
          {task.notes && (
            <InfoRow
              label="ملاحظات"
              value={
                <span className="flex items-center gap-1.5 text-right">
                  {task.notes}
                  <StickyNote className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                </span>
              }
            />
          )}
        </div>

        {/* Complete action — only for non-completed tasks, OWNER only */}
        {isOwner && !completed && (
          <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-3">
            {confirming ? (
              <>
                <div className="text-sm font-bold text-foreground text-right">
                  تأكيد إكمال المهمة
                </div>
                <p className="text-sm text-muted-foreground text-right">
                  سيتم تحويل حالة المهمة إلى مكتملة.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirming(false)}
                    disabled={mutations.complete.isPending}
                    className="flex-1 border border-border text-foreground rounded-xl py-3 text-sm font-semibold active:scale-[0.98] transition-transform"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={mutations.complete.isPending}
                    className="flex-1 rounded-xl py-3 text-sm font-semibold bg-[hsl(var(--status-available))] text-white active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                  >
                    {mutations.complete.isPending ? <Spinner /> : "تأكيد الإكمال"}
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => {
                  setConfirming(true);
                  setActionError(null);
                }}
                className="w-full flex items-center justify-center gap-2 bg-[hsl(var(--status-available))] text-white rounded-2xl py-4 text-base font-bold active:scale-[0.98] transition-transform shadow-sm"
              >
                <CheckCircle className="w-5 h-5" strokeWidth={2} />
                إكمال المهمة
              </button>
            )}
          </div>
        )}

        {completed && (
          <div className="rounded-2xl bg-[hsl(var(--status-available-bg))] border border-[hsl(var(--status-available))]/20 px-4 py-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--status-available))]">
              <ClipboardList className="w-4 h-4" strokeWidth={2} />
              هذه المهمة مكتملة
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
