import { useState } from "react";
import { useLocation } from "wouter";
import { Car, CheckCircle2, FileText, Pencil } from "lucide-react";
import { useGetVehicle } from "@workspace/api-client-react";

import { ExpenseCategoryBadge } from "@/features/expenses/components/ExpenseCategoryBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { ErrorState, InlineFeedback, InlineError, LoadingState } from "@/components/ui/FeedbackState";
import { FormField, inputClass } from "@/components/ui/FormField";
import { DetailSection, SummaryActionPanel } from "@/components/ui/SectionCard";
import { useExpense, useExpenseMutations } from "@/features/expenses/hooks";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDate, formatUsd } from "@/lib/format";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/labels";
import { useAuth } from "@/providers/AuthProvider";

interface DetailPageParams {
  params: { id: string };
}

function KeyValue({ label, value, numeric = false }: { label: string; value?: string | null; numeric?: boolean }) {
  return <div className="min-w-0 text-right"><div className="ui-label">{label}</div><div dir={numeric ? "ltr" : undefined} className={`mt-1.5 break-words text-sm font-semibold text-foreground ${numeric ? "number-ltr" : ""}`}>{value || "—"}</div></div>;
}

export default function ExpenseDetailPage({ params }: DetailPageParams) {
  const { id } = params;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const expenseQuery = useExpense(id);
  const expense = expenseQuery.data?.data;
  const vehicleQuery = useGetVehicle(expense?.vehicleId ?? "");
  const mutations = useExpenseMutations();

  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function beginEdit() {
    if (!expense) return;
    setCategory(expense.category);
    setAmount(String(expense.amount));
    setExpenseDate(expense.expenseDate.slice(0, 10));
    setDescription(expense.description ?? "");
    setFormError(null);
    setSuccessMsg(null);
    setEditing(true);
  }

  async function handleSave() {
    if (!expense) return;
    setFormError(null);
    const numericAmount = Number(amount);
    if (amount === "" || Number.isNaN(numericAmount) || numericAmount < 0) {
      setFormError("أدخل مبلغاً غير سالب.");
      return;
    }
    if (!expenseDate) {
      setFormError("أدخل تاريخ المصروف.");
      return;
    }

    try {
      await mutations.update.mutateAsync({
        id: expense.id,
        data: {
          category: category as typeof expense.category,
          amount: numericAmount,
          expense_date: new Date(`${expenseDate}T12:00:00Z`).toISOString(),
          ...(description.trim() ? { description: description.trim() } : { description: null }),
        },
      });
      setEditing(false);
      setSuccessMsg("تم تحديث المصروف.");
    } catch (error) {
      setFormError(getApiErrorMessage(error).title);
    }
  }

  if (expenseQuery.isLoading) {
    return <div className="min-h-full"><PageHeader title="تفاصيل المصروف" showBack /><div className="px-4 py-6 sm:px-6"><LoadingState rows={5} /></div></div>;
  }

  if (expenseQuery.isError || !expense) {
    return <div className="min-h-full"><PageHeader title="تفاصيل المصروف" showBack /><div className="px-4 py-6 sm:px-6"><ErrorState title="تعذر تحميل المصروف" description={expenseQuery.error ? getApiErrorMessage(expenseQuery.error).title : "لم يتم العثور على هذا المصروف."} onRetry={() => void expenseQuery.refetch()} /></div></div>;
  }

  const vehicle = vehicleQuery.data?.data;
  const categoryConfig = EXPENSE_CATEGORY_LABELS[expense.category];
  const CategoryIcon = categoryConfig.icon;

  return (
    <div className="min-h-full pb-8">
      <PageHeader title="تفاصيل المصروف" showBack />
      <div className="space-y-4 px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        {successMsg && <InlineFeedback variant="success" icon={CheckCircle2} onDismiss={() => setSuccessMsg(null)}>{successMsg}</InlineFeedback>}

        <DetailSection className="shadow-none">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3"><span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><CategoryIcon className="size-7" aria-hidden="true" /></span><div className="min-w-0"><div className="text-xs font-medium text-muted-foreground">مصروف</div><h2 className="truncate text-lg font-bold text-foreground">{categoryConfig.label}</h2><div className="number-ltr mt-1 text-xs text-muted-foreground">#{expense.id.slice(0, 8)}</div></div></div>
            <div><div className="ui-label mb-1">المبلغ</div><div dir="ltr" className="number-ltr text-xl font-bold text-foreground">{formatUsd(expense.amount)}</div></div>
          </div>
        </DetailSection>

        <div className="grid gap-4 xl:grid-cols-12 xl:items-start">
          <aside className="order-1 xl:order-2 xl:col-span-4">
            <SummaryActionPanel title="ملخص المصروف" description="القيمة والفئة والتاريخ المسجّلة لهذا المصروف.">
              <div className="space-y-4">
                <div className="grid gap-3 rounded-lg bg-muted/45 p-3 sm:grid-cols-2 xl:grid-cols-1">
                  <KeyValue label="المبلغ" value={formatUsd(expense.amount)} numeric />
                  <KeyValue label="تاريخ المصروف" value={formatDate(expense.expenseDate)} numeric />
                </div>
                <div><div className="ui-label mb-1.5">الفئة</div><ExpenseCategoryBadge category={expense.category} /></div>
                {isOwner && !editing && <Button type="button" variant="outline" className="w-full" onClick={beginEdit}><Pencil className="size-4" aria-hidden="true" />تعديل المصروف</Button>}
              </div>
            </SummaryActionPanel>
          </aside>

          <section aria-label="بيانات المصروف" className="order-2 space-y-4 xl:order-1 xl:col-span-8">
            {editing ? (
              <DetailSection title="تعديل المصروف" description="حدّث بيانات المصروف المسجّلة من دون تغيير ارتباطه الحالي بالمركبة.">
                <div className="space-y-4">
                  {formError && <InlineError className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5">{formError}</InlineError>}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="الفئة" required htmlFor="expense-category"><select id="expense-category" className={inputClass} value={category} onChange={(event) => setCategory(event.target.value)}>{(Object.keys(EXPENSE_CATEGORY_LABELS) as Array<keyof typeof EXPENSE_CATEGORY_LABELS>).map((value) => <option key={value} value={value}>{EXPENSE_CATEGORY_LABELS[value].label}</option>)}</select></FormField>
                    <FormField label="المبلغ" required hint="USD" htmlFor="expense-amount"><input id="expense-amount" type="number" dir="ltr" inputMode="decimal" min={0} value={amount} onChange={(event) => setAmount(event.target.value)} className={inputClass} /></FormField>
                    <FormField label="تاريخ المصروف" required htmlFor="expense-date"><DatePicker id="expense-date" value={expenseDate} onChange={setExpenseDate} /></FormField>
                    <FormField label="الوصف" hint="اختياري" htmlFor="expense-description"><input id="expense-description" className={inputClass} value={description} onChange={(event) => setDescription(event.target.value)} /></FormField>
                  </div>
                  <div className="flex flex-wrap gap-2 border-t border-border pt-4"><Button type="button" variant="outline" onClick={() => { setEditing(false); setFormError(null); }} disabled={mutations.update.isPending}>إلغاء</Button><Button type="button" onClick={handleSave} disabled={mutations.update.isPending}>{mutations.update.isPending ? "جارٍ الحفظ" : "حفظ التغييرات"}</Button></div>
                </div>
              </DetailSection>
            ) : (
              <>
                <DetailSection title="تفاصيل المصروف" description="الفئة والقيمة وتاريخ تسجيل المصروف.">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-3">
                    <div className="text-right"><div className="ui-label">الفئة</div><div className="mt-1.5"><ExpenseCategoryBadge category={expense.category} /></div></div>
                    <KeyValue label="المبلغ" value={formatUsd(expense.amount)} numeric />
                    <KeyValue label="تاريخ المصروف" value={formatDate(expense.expenseDate)} numeric />
                  </div>
                </DetailSection>

                <DetailSection title="المركبة المرتبطة" description="تظهر المركبة فقط عندما يكون المصروف مسجّلاً عليها.">
                  {expense.vehicleId ? <div className="flex items-center gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Car className="size-5" aria-hidden="true" /></span><div className="min-w-0">{vehicle ? <button type="button" onClick={() => setLocation(`/vehicles/${vehicle.id}`)} className="block truncate text-start text-base font-semibold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">{vehicle.make} {vehicle.model}</button> : <span className="text-sm text-muted-foreground">جارٍ تحميل بيانات المركبة</span>}{vehicle && <div dir="ltr" className="number-ltr mt-1 text-sm text-muted-foreground">{vehicle.plateNumber}</div>}</div></div> : <p className="text-sm text-muted-foreground">هذا مصروف عام غير مرتبط بمركبة.</p>}
                </DetailSection>

                {expense.description && <DetailSection title="الوصف"><div className="flex items-start gap-2"><FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{expense.description}</p></div></DetailSection>}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
