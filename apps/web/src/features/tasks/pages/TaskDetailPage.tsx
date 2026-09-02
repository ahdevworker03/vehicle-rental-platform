import { useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, ClipboardList, Pencil, Repeat2, StickyNote, Trash2 } from "lucide-react";
import type { UpdateTaskRequest } from "@workspace/api-client-react";

import { PageHeader } from "@/components/layout/PageHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ErrorState, InlineFeedback, InlineError, LoadingState } from "@/components/ui/FeedbackState";
import { DetailSection, SummaryActionPanel } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FormField, inputClass } from "@/components/ui/FormField";
import { TaskRecurrenceFields } from "@/features/tasks/components/TaskRecurrenceFields";
import { useTask, useTaskMutations } from "@/features/tasks/hooks";
import {
  EMPTY_TASK_RECURRENCE,
  formatTaskDueDate,
  formatTaskRecurrence,
  formatTaskRecurrenceEnd,
  getTaskRecurrencePayload,
  isRecurringTask,
  taskDueDateInputValue,
  taskToRecurrenceForm,
  validateTaskRecurrence,
  type TaskRecurrenceErrors,
} from "@/features/tasks/recurrence";
import { isTaskOverdue } from "@/features/tasks/selectors";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthProvider";

interface DetailPageParams {
  params: { id: string };
}

function KeyValue({ label, value, numeric = false }: { label: string; value?: string | null; numeric?: boolean }) {
  return <div className="min-w-0"><div className="ui-label">{label}</div><div dir={numeric ? "ltr" : "auto"} className={`mt-1 wrap-break-word text-sm font-semibold text-foreground ${numeric ? "number-ltr text-end" : ""}`}>{value || "—"}</div></div>;
}

export default function TaskDetailPage({ params }: DetailPageParams) {
  const { id } = params;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const taskQuery = useTask(id);
  const task = taskQuery.data?.data;
  const mutations = useTaskMutations();
  const [confirmingComplete, setConfirmingComplete] = useState(false);
  const [stopOpen, setStopOpen] = useState(false);
  const [recurrenceStopped, setRecurrenceStopped] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [recurrence, setRecurrence] = useState({ ...EMPTY_TASK_RECURRENCE });
  const [recurrenceErrors, setRecurrenceErrors] = useState<TaskRecurrenceErrors>({});

  function beginEdit() {
    if (!task) return;
    setTitle(task.title);
    setTitleError(null);
    setDueDate(taskDueDateInputValue(task.dueDate));
    setNotes(task.notes ?? "");
    setRecurrence(taskToRecurrenceForm(task));
    setRecurrenceErrors({});
    setActionError(null);
    setEditing(true);
  }

  async function handleSave() {
    if (!task || !dueDate) return;
    if (!title.trim()) {
      setTitleError("أدخل اسم المهمة.");
      return;
    }
    const nextRecurrenceErrors = validateTaskRecurrence(recurrence);
    setRecurrenceErrors(nextRecurrenceErrors);
    if (Object.keys(nextRecurrenceErrors).length > 0) return;

    setActionError(null);
    try {
      const data: UpdateTaskRequest = {
        title: title.trim(),
        due_date: new Date(`${dueDate}T12:00:00Z`).toISOString(),
        notes: notes.trim() || null,
        ...getTaskRecurrencePayload(recurrence),
      };
      await mutations.update.mutateAsync({ id: task.id, data });
      setEditing(false);
      setSuccessMsg("تم تحديث المهمة.");
    } catch (error) {
      setActionError(getApiErrorMessage(error).title);
    }
  }

  async function handleComplete() {
    if (!task) return;
    setActionError(null);
    try {
      await mutations.complete.mutateAsync({ id: task.id });
      setSuccessMsg("تم إكمال المهمة.");
      setConfirmingComplete(false);
    } catch (error) {
      setActionError(getApiErrorMessage(error).title);
    }
  }

  async function handleStopRecurrence() {
    if (!task) return;
    setActionError(null);
    try {
      await mutations.update.mutateAsync({
        id: task.id,
        data: {
          recurrence_interval: null,
          recurrence_unit: null,
          recurrence_end_date: null,
          recurrence_end_count: null,
        },
      });
      setStopOpen(false);
      setRecurrenceStopped(true);
      setSuccessMsg("تم إيقاف التكرار.");
    } catch (error) {
      setActionError(getApiErrorMessage(error).title);
    }
  }

  async function handleDelete() {
    if (!task) return;
    setActionError(null);
    try {
      await mutations.remove.mutateAsync({ id: task.id });
      setDeleteOpen(false);
      setLocation("/tasks");
    } catch (error) {
      setActionError(getApiErrorMessage(error).title);
    }
  }

  if (taskQuery.isLoading) return <div className="min-h-full"><PageHeader title="تفاصيل المهمة" showBack /><div className="px-4 py-6 sm:px-6"><LoadingState rows={4} /></div></div>;
  if (taskQuery.isError || !task) return <div className="min-h-full"><PageHeader title="تفاصيل المهمة" showBack /><div className="px-4 py-6 sm:px-6"><ErrorState title="تعذر تحميل المهمة" description={taskQuery.error ? getApiErrorMessage(taskQuery.error).title : "لم يتم العثور على هذه المهمة."} onRetry={() => void taskQuery.refetch()} /></div></div>;

  const completed = task.status === "COMPLETED";
  const overdue = !completed && isTaskOverdue(task);
  const recurring = isRecurringTask(task) && !recurrenceStopped;
  const recurrenceLabel = formatTaskRecurrence(task);
  const TaskIcon = completed ? CheckCircle2 : ClipboardList;

  return (
    <div className="min-h-full pb-8">
      <PageHeader title="تفاصيل المهمة" showBack />
      <div className="space-y-4 px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        {successMsg && <InlineFeedback variant="success" icon={CheckCircle2} onDismiss={() => setSuccessMsg(null)}>{successMsg}</InlineFeedback>}
        {actionError && <InlineError className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5">{actionError}</InlineError>}

        <DetailSection className="shadow-none">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3"><span className={`flex size-14 shrink-0 items-center justify-center rounded-xl ${completed ? "bg-status-positive-bg text-status-positive" : overdue ? "bg-status-danger-bg text-status-danger" : "bg-primary/10 text-primary"}`}><TaskIcon className="size-7" aria-hidden="true" /></span><div className="min-w-0"><div className="text-xs font-medium text-muted-foreground">مهمة</div><h2 className="truncate text-lg font-bold text-foreground">{task.title}</h2></div></div>
            <div><div className="ui-label mb-1">حالة المهمة</div><StatusBadge status={task.status} /></div>
          </div>
          <div dir="ltr" className="number-ltr mt-2 w-full text-right text-xs text-muted-foreground">#{task.id.slice(0, 8)}</div>
        </DetailSection>

        <div className="grid gap-4 xl:grid-cols-12 xl:items-start">
          <aside className="order-1 xl:order-2 xl:col-span-4">
            <SummaryActionPanel title="حالة المهمة وإجراءاتها" description="تابع موعد الاستحقاق وأكمل المهمة عند الانتهاء.">
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/45 p-3"><KeyValue label="تاريخ الاستحقاق" value={formatTaskDueDate(task.dueDate)} numeric /></div>
                <div className="flex flex-col items-start gap-1.5"><div className="ui-label">الحالة</div><StatusBadge status={task.status} /></div>
                {overdue && <div><div className="ui-label mb-1.5">حالة الاستحقاق</div><StatusBadge status="OVERDUE" label="متأخرة" /></div>}
                {recurring && !completed && <InlineFeedback variant="info">مهمة {recurrenceLabel}. عند الإكمال، تُنشأ المهمة التالية ما دام التكرار فعالاً.</InlineFeedback>}
                {isOwner && !completed && <Button type="button" variant="outline" className="w-full" onClick={beginEdit}><Pencil className="size-4" aria-hidden="true" />تعديل المهمة</Button>}
                {isOwner && !completed && (confirmingComplete ? <div className="space-y-3 border-t border-border pt-4"><div><h3 className="text-sm font-semibold text-foreground">تأكيد إكمال المهمة</h3><p className="ui-secondary-text mt-1">سيتم تحويل حالة المهمة إلى مكتملة.</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => { setConfirmingComplete(false); setActionError(null); }} disabled={mutations.complete.isPending}>إلغاء</Button><Button type="button" onClick={() => void handleComplete()} disabled={mutations.complete.isPending}>{mutations.complete.isPending ? "جارٍ الحفظ" : "تأكيد الإكمال"}</Button></div></div> : <Button type="button" className="w-full" onClick={() => { setConfirmingComplete(true); setActionError(null); }}><CheckCircle2 className="size-4" aria-hidden="true" />إكمال المهمة</Button>)}
                {isOwner && !completed && recurring && <Button type="button" variant="outline" className="w-full" onClick={() => setStopOpen(true)}><Repeat2 className="size-4" aria-hidden="true" />إيقاف التكرار</Button>}
                {isOwner && <Button type="button" variant="destructive" className="w-full" onClick={() => setDeleteOpen(true)}><Trash2 className="size-4" aria-hidden="true" />حذف المهمة</Button>}
                {!isOwner && !completed && <InlineFeedback variant="info">لا تملك صلاحية إكمال المهمة.</InlineFeedback>}
                {completed && <InlineFeedback variant="success" icon={CheckCircle2}>هذه المهمة مكتملة ومحفوظة ضمن السجل.</InlineFeedback>}
              </div>
            </SummaryActionPanel>
          </aside>

          <section aria-label="بيانات المهمة" className="order-2 space-y-4 xl:order-1 xl:col-span-8">
            {editing && <DetailSection title="تعديل المهمة"><div className="grid gap-4 sm:grid-cols-2"><FormField label="اسم المهمة" required error={titleError ?? undefined} className="sm:col-span-2" htmlFor="edit-task-title"><input id="edit-task-title" type="text" className={titleError ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass} value={title} onChange={(event) => { setTitle(event.target.value); setTitleError(null); }} aria-invalid={Boolean(titleError)} /></FormField><FormField label="تاريخ الاستحقاق" htmlFor="edit-task-due"><input id="edit-task-due" type="date" dir="ltr" className={inputClass} value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></FormField><FormField label="ملاحظات" className="sm:col-span-2" htmlFor="edit-task-notes"><textarea id="edit-task-notes" rows={3} className={`${inputClass} resize-none`} value={notes} onChange={(event) => setNotes(event.target.value)} /></FormField><TaskRecurrenceFields idPrefix="edit-task" value={recurrence} errors={recurrenceErrors} onChange={(value) => { setRecurrence(value); setRecurrenceErrors({}); }} /></div><div className="mt-4 flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setEditing(false)}>إلغاء</Button><Button type="button" onClick={() => void handleSave()} disabled={!dueDate || mutations.update.isPending}>{mutations.update.isPending ? "جارٍ الحفظ" : "حفظ التعديلات"}</Button></div></DetailSection>}
            <DetailSection title="ملخص المهمة" description="الملاحظات والموعد والحالة المسجلة للمهمة.">
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3"><KeyValue label="اسم المهمة" value={task.title} /><div><div className="ui-label">الحالة</div><div className="mt-1"><StatusBadge status={task.status} /></div></div><KeyValue label="تاريخ الاستحقاق" value={formatTaskDueDate(task.dueDate)} numeric /><KeyValue label="التكرار" value={recurring ? recurrenceLabel : "بدون تكرار"} />{recurring && <KeyValue label="نهاية التكرار" value={formatTaskRecurrenceEnd(task)} />}{task.occurrenceNumber > 1 && <KeyValue label="رقم التكرار" value={String(task.occurrenceNumber)} numeric />}{task.predecessorId && <KeyValue label="المهمة السابقة" value={`التكرار رقم ${task.occurrenceNumber - 1}`} />}{overdue && <div><div className="ui-label">حالة الاستحقاق</div><div className="mt-1"><StatusBadge status="OVERDUE" label="متأخرة" /></div></div>}</div>
            </DetailSection>
            <DetailSection title="الملاحظات"><div className="flex items-start gap-2"><StickyNote className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{task.notes || "لا توجد ملاحظات لهذه المهمة."}</p></div></DetailSection>
          </section>
        </div>
      </div>

      <AlertDialog open={stopOpen} onOpenChange={setStopOpen}>
        <AlertDialogContent dir="rtl" className="max-w-md">
          <AlertDialogHeader className="text-start sm:text-start">
            <AlertDialogTitle>إيقاف التكرار</AlertDialogTitle>
            <AlertDialogDescription>ستبقى المهمة الحالية وسجل المهام السابقة محفوظين، ولن تُنشأ مهمة مستقبلية بعد إكمال الحالية.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:space-x-0">
            <AlertDialogCancel disabled={mutations.update.isPending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction asChild><Button type="button" onClick={(event) => { event.preventDefault(); void handleStopRecurrence(); }} disabled={mutations.update.isPending}>{mutations.update.isPending ? "جارٍ الإيقاف" : "تأكيد الإيقاف"}</Button></AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent dir="rtl" className="max-w-md">
          <AlertDialogHeader className="text-start sm:text-start">
            <AlertDialogTitle>حذف المهمة</AlertDialogTitle>
            <AlertDialogDescription>ستُحذف المهمة المحددة من القوائم والعروض المعتادة فقط. لن يتم حذف سلسلة التكرار كاملة.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:space-x-0">
            <AlertDialogCancel disabled={mutations.remove.isPending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction asChild><Button type="button" variant="destructive" onClick={(event) => { event.preventDefault(); void handleDelete(); }} disabled={mutations.remove.isPending}>{mutations.remove.isPending ? "جارٍ الحذف" : "تأكيد الحذف"}</Button></AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
