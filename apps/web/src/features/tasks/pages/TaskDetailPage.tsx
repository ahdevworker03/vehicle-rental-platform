import { useState } from "react";
import { CheckCircle2, ClipboardList, Pencil, StickyNote } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ErrorState, InfoBanner, InlineError, LoadingState } from "@/components/ui/FeedbackState";
import { DetailSection, SummaryActionPanel } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FormField, inputClass } from "@/components/ui/FormField";
import { useTask, useTaskMutations } from "@/features/tasks/hooks";
import { isTaskOverdue } from "@/features/tasks/selectors";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/providers/AuthProvider";

interface DetailPageParams {
  params: { id: string };
}

function KeyValue({ label, value, numeric = false, alignValueToLabel = false }: { label: string; value?: string | null; numeric?: boolean; alignValueToLabel?: boolean }) {
  return <div className="min-w-0"><div className="ui-label">{label}</div><div dir={numeric ? "ltr" : undefined} className={`mt-1 break-words text-sm font-semibold text-foreground ${numeric ? "number-ltr" : ""} ${alignValueToLabel ? "text-right" : ""}`}>{value || "—"}</div></div>;
}

export default function TaskDetailPage({ params }: DetailPageParams) {
  const { id } = params;
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const taskQuery = useTask(id);
  const task = taskQuery.data?.data;
  const mutations = useTaskMutations();
  const [confirming, setConfirming] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [recurrenceType, setRecurrenceType] = useState<"NONE" | "DAILY" | "WEEKLY" | "MONTHLY">("NONE");

  function beginEdit() {
    if (!task) return;
    setDueDate(task.dueDate.slice(0, 10));
    setNotes(task.notes ?? "");
    setRecurrenceType(task.recurrenceType);
    setActionError(null);
    setEditing(true);
  }

  async function handleSave() {
    if (!task || !dueDate) return;
    setActionError(null);
    try {
      await mutations.update.mutateAsync({ id: task.id, data: { due_date: new Date(`${dueDate}T12:00:00Z`).toISOString(), notes: notes.trim() || null, recurrence_type: recurrenceType } });
      setEditing(false);
      setSuccessMsg("تم تحديث المهمة.");
    } catch (error) { setActionError(getApiErrorMessage(error).title); }
  }

  async function handleComplete() {
    if (!task) return;
    setActionError(null);
    try {
      await mutations.complete.mutateAsync({ id: task.id });
      setSuccessMsg("تم إكمال المهمة.");
      setConfirming(false);
    } catch (error) {
      setActionError(getApiErrorMessage(error).title);
    }
  }

  if (taskQuery.isLoading) return <div className="min-h-full"><PageHeader title="تفاصيل المهمة" showBack /><div className="px-4 py-6 sm:px-6"><LoadingState rows={4} /></div></div>;
  if (taskQuery.isError || !task) return <div className="min-h-full"><PageHeader title="تفاصيل المهمة" showBack /><div className="px-4 py-6 sm:px-6"><ErrorState title="تعذر تحميل المهمة" description={taskQuery.error ? getApiErrorMessage(taskQuery.error).title : "لم يتم العثور على هذه المهمة."} onRetry={() => void taskQuery.refetch()} /></div></div>;

  const completed = task.status === "COMPLETED";
  const overdue = !completed && isTaskOverdue(task);
  const TaskIcon = completed ? CheckCircle2 : ClipboardList;
  const recurrenceLabel = { NONE: "بدون تكرار", DAILY: "يومي", WEEKLY: "أسبوعي", MONTHLY: "شهري" }[task.recurrenceType];

  return (
    <div className="min-h-full pb-8">
      <PageHeader title="تفاصيل المهمة" showBack />
      <div className="space-y-4 px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        {successMsg && <InfoBanner icon={CheckCircle2}>{successMsg}</InfoBanner>}
        {actionError && <InlineError className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5">{actionError}</InlineError>}

        <DetailSection className="shadow-none">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3"><span className={`flex size-14 shrink-0 items-center justify-center rounded-xl ${completed ? "bg-status-positive-bg text-status-positive" : overdue ? "bg-status-danger-bg text-status-danger" : "bg-primary/10 text-primary"}`}><TaskIcon className="size-7" aria-hidden="true" /></span><div className="min-w-0"><div className="text-xs font-medium text-muted-foreground">مهمة</div><h2 className="truncate text-lg font-bold text-foreground">{task.notes || "مهمة بدون ملاحظات"}</h2></div></div>
            <div><div className="ui-label mb-1">حالة المهمة</div><StatusBadge status={task.status} /></div>
          </div>
          <div dir="ltr" className="number-ltr mt-2 w-full text-right text-xs text-muted-foreground">#{task.id.slice(0, 8)}</div>
        </DetailSection>

        <div className="grid gap-4 xl:grid-cols-12 xl:items-start">
          <aside className="order-1 xl:order-2 xl:col-span-4">
            <SummaryActionPanel title="حالة المهمة وإجراءاتها" description="تابع موعد الاستحقاق وأكمل المهمة عند الانتهاء.">
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/45 p-3"><KeyValue label="تاريخ الاستحقاق" value={formatDate(task.dueDate)} numeric alignValueToLabel /></div>
                <div className="flex flex-col items-start gap-1.5"><div className="ui-label">الحالة</div><StatusBadge status={task.status} /></div>
                {overdue && <div><div className="ui-label mb-1.5">حالة الاستحقاق</div><StatusBadge status="OVERDUE" label="متأخرة" /></div>}
                {task.recurrenceType !== "NONE" && <InfoBanner>مهمة {recurrenceLabel}. عند الإكمال، ينشئ الخادم المهمة التالية وفق هذا التكرار.</InfoBanner>}
                {isOwner && !completed && <Button type="button" variant="outline" className="w-full" onClick={beginEdit}><Pencil className="size-4" aria-hidden="true" />تعديل المهمة</Button>}
                {isOwner && !completed && (confirming ? <div className="space-y-3 border-t border-border pt-4"><div><h3 className="text-sm font-semibold text-foreground">تأكيد إكمال المهمة</h3><p className="ui-secondary-text mt-1">سيتم تحويل حالة المهمة إلى مكتملة.</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => { setConfirming(false); setActionError(null); }} disabled={mutations.complete.isPending}>إلغاء</Button><Button type="button" onClick={handleComplete} disabled={mutations.complete.isPending}>{mutations.complete.isPending ? "جارٍ الحفظ" : "تأكيد الإكمال"}</Button></div></div> : <Button type="button" className="w-full" onClick={() => { setConfirming(true); setActionError(null); }}><CheckCircle2 className="size-4" aria-hidden="true" />إكمال المهمة</Button>)}
                {!isOwner && !completed && <InfoBanner>لا تملك صلاحية إكمال المهمة.</InfoBanner>}
                {completed && <InfoBanner icon={CheckCircle2}>هذه المهمة مكتملة ولا تتطلب إجراءً إضافياً.</InfoBanner>}
              </div>
            </SummaryActionPanel>
          </aside>

          <section aria-label="بيانات المهمة" className="order-2 space-y-4 xl:order-1 xl:col-span-8">
            {editing && <DetailSection title="تعديل المهمة"><div className="grid gap-4 sm:grid-cols-2"><FormField label="تاريخ الاستحقاق" htmlFor="edit-task-due"><input id="edit-task-due" type="date" className={inputClass} value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></FormField><FormField label="التكرار" htmlFor="edit-task-recurrence"><select id="edit-task-recurrence" className={inputClass} value={recurrenceType} onChange={(event) => setRecurrenceType(event.target.value as typeof recurrenceType)}><option value="NONE">بدون تكرار</option><option value="DAILY">يومي</option><option value="WEEKLY">أسبوعي</option><option value="MONTHLY">شهري</option></select></FormField><FormField label="ملاحظات" className="sm:col-span-2" htmlFor="edit-task-notes"><textarea id="edit-task-notes" rows={3} className={`${inputClass} resize-none`} value={notes} onChange={(event) => setNotes(event.target.value)} /></FormField></div><div className="mt-4 flex gap-2"><Button type="button" variant="outline" onClick={() => setEditing(false)}>إلغاء</Button><Button type="button" onClick={() => void handleSave()} disabled={!dueDate || mutations.update.isPending}>{mutations.update.isPending ? "جارٍ الحفظ" : "حفظ التعديلات"}</Button></div></DetailSection>}
            <DetailSection title="ملخص المهمة" description="الملاحظات والموعد والحالة المسجلة للمهمة.">
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3"><div><div className="ui-label">الحالة</div><div className="mt-1"><StatusBadge status={task.status} /></div></div><KeyValue label="تاريخ الاستحقاق" value={formatDate(task.dueDate)} numeric alignValueToLabel /><KeyValue label="التكرار" value={recurrenceLabel} />{task.predecessorId && <KeyValue label="المهمة السابقة" value={task.predecessorId.slice(0, 8)} numeric />}{overdue && <div><div className="ui-label">حالة الاستحقاق</div><div className="mt-1"><StatusBadge status="OVERDUE" label="متأخرة" /></div></div>}</div>
            </DetailSection>
            <DetailSection title="الملاحظات"><div className="flex items-start gap-2"><StickyNote className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{task.notes || "لا توجد ملاحظات لهذه المهمة."}</p></div></DetailSection>
          </section>
        </div>
      </div>
    </div>
  );
}
