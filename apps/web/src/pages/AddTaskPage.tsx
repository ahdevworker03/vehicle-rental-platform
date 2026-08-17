import { useState } from "react";
import { useLocation } from "wouter";
import { Check, ClipboardList } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { FormField, inputClass } from "@/components/ui/FormField";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api-error";
import { useTaskMutations } from "@/features/tasks/hooks";

function toISO(dateStr: string): string {
  return new Date(dateStr + "T12:00:00Z").toISOString();
}

export default function AddTaskPage() {
  const [, setLocation] = useLocation();
  const mutations = useTaskMutations();

  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function clearError(key: string) {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!dueDate) errs.dueDate = "أدخل تاريخ الاستحقاق";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (mutations.create.isPending) return;
    if (!validate()) return;

    setFormError(null);

    try {
      await mutations.create.mutateAsync({
        data: {
          due_date: toISO(dueDate),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        },
      });
      setSaved(true);
      setTimeout(() => setLocation("/tasks"), 1200);
    } catch (err) {
      setFormError(getApiErrorMessage(err).title);
    }
  }

  const isSubmitting = mutations.create.isPending;

  if (saved) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 gap-3">
        <div className="w-20 h-20 rounded-full bg-[hsl(var(--status-available-bg))] flex items-center justify-center">
          <Check className="w-10 h-10 text-[hsl(var(--status-available))]" strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-bold text-foreground">تم إنشاء المهمة</h2>
        <p className="text-xs text-muted-foreground pt-2">
          جاري العودة إلى قائمة المهام...
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="إضافة مهمة"
        showBack
        onBack={() => setLocation("/tasks")}
      />

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 space-y-4">
        {formError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        {/* Header card */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[hsl(var(--status-maintenance-bg))] flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-6 h-6 text-[hsl(var(--status-maintenance))]" strokeWidth={1.5} />
          </div>
          <div className="text-right flex-1">
            <div className="text-base font-bold text-foreground">مهمة جديدة</div>
            <div className="text-sm text-muted-foreground">الحالة الافتراضية: قيد الانتظار</div>
          </div>
        </div>

        {/* Due date */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4">
          <FormField label="تاريخ الاستحقاق" required error={errors.dueDate} htmlFor="task-due-date">
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                clearError("dueDate");
              }}
              className={errors.dueDate ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
            />
          </FormField>
        </div>

        {/* Notes */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4">
          <FormField label="ملاحظات" hint="اختياري" htmlFor="task-notes">
            <textarea
              id="task-notes"
              placeholder="وصف المهمة، تذكير... مثال: تجديد التأمين"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </FormField>
        </div>

        {/* Save */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={cn(
            "w-full rounded-2xl py-4 text-base font-bold transition-all shadow-sm flex items-center justify-center gap-2",
            isSubmitting
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground active:scale-[0.98]"
          )}
        >
          {isSubmitting ? <Spinner /> : "إنشاء المهمة"}
        </button>
      </div>
    </>
  );
}
