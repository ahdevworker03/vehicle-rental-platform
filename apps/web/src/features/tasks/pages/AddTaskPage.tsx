import { useState } from "react";
import { useLocation } from "wouter";
import { Check, ClipboardList } from "lucide-react";
import type { CreateTaskRequestRecurrenceType } from "@workspace/api-client-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { InlineError } from "@/components/ui/FeedbackState";
import { FormField, inputClass } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormSection";
import { useTaskMutations } from "@/features/tasks/hooks";
import { getApiErrorMessage } from "@/lib/api-error";

function toISO(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00Z`).toISOString();
}

export default function AddTaskPage() {
  const [, setLocation] = useLocation();
  const mutations = useTaskMutations();
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [recurrenceType, setRecurrenceType] = useState<CreateTaskRequestRecurrenceType>("NONE");
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
    if (!dueDate) nextErrors.dueDate = "أدخل تاريخ الاستحقاق.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (mutations.create.isPending || !validate()) return;
    setFormError(null);
    try {
      await mutations.create.mutateAsync({ data: { due_date: toISO(dueDate), recurrence_type: recurrenceType, ...(notes.trim() ? { notes: notes.trim() } : {}) } });
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
      <form className="mx-auto max-w-3xl space-y-4 px-4 pb-24 pt-4 sm:px-6 lg:space-y-5" onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }}>
        {formError && <InlineError className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5">{formError}</InlineError>}
        <FormSection title="تفاصيل المهمة" description="المهمة الجديدة تُسجل بحالة قيد الانتظار حتى إكمالها.">
          <FormField label="تاريخ الاستحقاق" required error={errors.dueDate} htmlFor="task-due-date"><input id="task-due-date" type="date" value={dueDate} onChange={(event) => { setDueDate(event.target.value); clearError("dueDate"); }} className={errors.dueDate ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass} /></FormField>
          <FormField label="ملاحظات" hint="اختياري" className="md:col-span-2" htmlFor="task-notes"><textarea id="task-notes" rows={4} className={`${inputClass} resize-none`} placeholder="مثال: تجديد التأمين" value={notes} onChange={(event) => setNotes(event.target.value)} /></FormField>
          <FormField label="التكرار" hint="يُنشئ الخادم المهمة التالية عند الإكمال فقط." className="md:col-span-2" htmlFor="task-recurrence"><select id="task-recurrence" className={inputClass} value={recurrenceType} onChange={(event) => setRecurrenceType(event.target.value as CreateTaskRequestRecurrenceType)}><option value="NONE">بدون تكرار</option><option value="DAILY">يومي</option><option value="WEEKLY">أسبوعي</option><option value="MONTHLY">شهري</option></select></FormField>
        </FormSection>

        <div className="sticky bottom-3 z-10 flex flex-wrap justify-end gap-2 rounded-xl border border-card-border bg-card/95 p-3 shadow-sm backdrop-blur sm:px-4"><Button type="button" variant="outline" onClick={() => setLocation("/tasks")} disabled={isSubmitting}>إلغاء</Button><Button type="submit" disabled={isSubmitting}><ClipboardList className="size-4" aria-hidden="true" />{isSubmitting ? "جارٍ الحفظ" : "إنشاء المهمة"}</Button></div>
      </form>
    </div>
  );
}
