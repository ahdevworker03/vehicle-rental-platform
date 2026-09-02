import { useState } from "react";
import { useLocation } from "wouter";
import { Check, ClipboardList } from "lucide-react";
import type { CreateTaskRequest } from "@workspace/api-client-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { InlineError } from "@/components/ui/FeedbackState";
import { FormField, inputClass } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormSection";
import { TaskRecurrenceFields } from "@/features/tasks/components/TaskRecurrenceFields";
import { useTaskMutations } from "@/features/tasks/hooks";
import {
  EMPTY_TASK_RECURRENCE,
  getTaskRecurrencePayload,
  validateTaskRecurrence,
  type TaskRecurrenceErrors,
} from "@/features/tasks/recurrence";
import { getApiErrorMessage } from "@/lib/api-error";

function toISO(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00Z`).toISOString();
}

export default function AddTaskPage() {
  const [, setLocation] = useLocation();
  const mutations = useTaskMutations();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [recurrence, setRecurrence] = useState({ ...EMPTY_TASK_RECURRENCE });
  const [recurrenceErrors, setRecurrenceErrors] = useState<TaskRecurrenceErrors>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function clearError(key: string) {
    if (!errors[key]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = "أدخل اسم المهمة.";
    if (!dueDate) nextErrors.dueDate = "أدخل تاريخ الاستحقاق.";
    const nextRecurrenceErrors = validateTaskRecurrence(recurrence);
    setErrors(nextErrors);
    setRecurrenceErrors(nextRecurrenceErrors);
    return Object.keys(nextErrors).length === 0 && Object.keys(nextRecurrenceErrors).length === 0;
  }

  async function handleSubmit() {
    if (mutations.create.isPending || !validate()) return;
    setFormError(null);
    try {
      const data: CreateTaskRequest = {
        title: title.trim(),
        due_date: toISO(dueDate),
        ...getTaskRecurrencePayload(recurrence),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      };
      await mutations.create.mutateAsync({ data });
      setSaved(true);
      setTimeout(() => setLocation("/tasks"), 1200);
    } catch (error) {
      setFormError(getApiErrorMessage(error).title);
    }
  }

  if (saved) {
    return <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 bg-background px-6"><div className="flex size-20 items-center justify-center rounded-full bg-status-positive-bg text-status-positive"><Check className="size-10" aria-hidden="true" /></div><h2 className="text-xl font-bold text-foreground">تم إنشاء المهمة.</h2><p className="text-sm text-muted-foreground">جارٍ العودة إلى قائمة المهام...</p></div>;
  }

  const isSubmitting = mutations.create.isPending;

  return (
    <div className="min-h-full">
      <PageHeader title="إضافة مهمة" showBack onBack={() => setLocation("/tasks")} />
      <form noValidate className="mx-auto max-w-3xl space-y-4 px-4 pb-24 pt-4 sm:px-6 lg:space-y-5" onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }}>
        {formError && <InlineError className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5">{formError}</InlineError>}
        <FormSection title="تفاصيل المهمة" description="المهمة الجديدة تُسجل بحالة قيد الانتظار حتى إكمالها.">
          <FormField label="اسم المهمة" required error={errors.title} className="md:col-span-2" htmlFor="task-title"><input id="task-title" type="text" required value={title} onChange={(event) => { setTitle(event.target.value); clearError("title"); }} placeholder="مثال: تجديد تأمين المركبة" aria-invalid={Boolean(errors.title)} className={errors.title ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass} /></FormField>
          <FormField label="تاريخ الاستحقاق" required error={errors.dueDate} htmlFor="task-due-date"><DatePicker id="task-due-date" value={dueDate} onChange={(value) => { setDueDate(value); clearError("dueDate"); }} aria-invalid={Boolean(errors.dueDate)} className={errors.dueDate ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass} /></FormField>
          <FormField label="ملاحظات" hint="اختياري" className="md:col-span-2" htmlFor="task-notes"><textarea id="task-notes" rows={4} className={`${inputClass} resize-none`} placeholder="مثال: تجديد التأمين" value={notes} onChange={(event) => setNotes(event.target.value)} /></FormField>
          <TaskRecurrenceFields
            idPrefix="task"
            value={recurrence}
            errors={recurrenceErrors}
            onChange={(value) => {
              setRecurrence(value);
              setRecurrenceErrors({});
            }}
          />
        </FormSection>

        <div className="sticky bottom-3 z-10 flex flex-wrap justify-end gap-2 rounded-xl border border-card-border bg-card/95 p-3 shadow-sm backdrop-blur sm:px-4"><Button type="button" variant="outline" onClick={() => setLocation("/tasks")} disabled={isSubmitting}>إلغاء</Button><Button type="submit" disabled={isSubmitting}><ClipboardList className="size-4" aria-hidden="true" />{isSubmitting ? "جارٍ الحفظ" : "إنشاء المهمة"}</Button></div>
      </form>
    </div>
  );
}
