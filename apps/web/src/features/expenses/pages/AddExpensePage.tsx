import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Car, Check, ChevronDown, Search } from "lucide-react";
import type { CreateExpenseRequestCategory } from "@workspace/api-client-react";
import { useListVehicles } from "@workspace/api-client-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { InlineError } from "@/components/ui/FeedbackState";
import { FormField, inputClass } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormSection";
import { Spinner } from "@/components/ui/spinner";
import { useExpenseMutations } from "@/features/expenses/hooks";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/api-error";
import { EXPENSE_CATEGORY_OPTIONS } from "@/lib/labels";
import { cn } from "@/lib/utils";

function toISO(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00Z`).toISOString();
}

export default function AddExpensePage() {
  const [, setLocation] = useLocation();
  const mutations = useExpenseMutations();
  const [category, setCategory] = useState<CreateExpenseRequestCategory | "">("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [description, setDescription] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const debouncedVehicleSearch = useDebouncedValue(vehicleSearch.trim(), 300);
  const { data: vehiclesData, isLoading: vehiclesLoading } = useListVehicles();
  const vehicles = useMemo(() => vehiclesData?.data ?? [], [vehiclesData]);
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId);
  const filteredVehicles = useMemo(() => {
    const query = debouncedVehicleSearch.toLowerCase();
    if (!query) return vehicles;
    return vehicles.filter((vehicle) => `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(query) || vehicle.plateNumber.toLowerCase().includes(query));
  }, [debouncedVehicleSearch, vehicles]);

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
    if (!category) nextErrors.category = "اختر الفئة.";
    if (amount === "" || Number.isNaN(Number(amount))) nextErrors.amount = "أدخل مبلغاً صحيحاً.";
    else if (Number(amount) < 0) nextErrors.amount = "أدخل مبلغاً غير سالب.";
    if (!expenseDate) nextErrors.expenseDate = "أدخل تاريخ المصروف.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (mutations.create.isPending || !validate()) return;
    setFormError(null);
    try {
      await mutations.create.mutateAsync({
        data: {
          ...(selectedVehicleId ? { vehicle_id: selectedVehicleId } : {}),
          category: category as CreateExpenseRequestCategory,
          amount: Number(amount),
          expense_date: toISO(expenseDate),
          ...(description.trim() ? { description: description.trim() } : {}),
        },
      });
      setSaved(true);
      setTimeout(() => setLocation("/expenses"), 1200);
    } catch (error) {
      setFormError(getApiErrorMessage(error).title);
    }
  }

  if (saved) {
    return <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 bg-background px-6"><div className="flex size-20 items-center justify-center rounded-full bg-status-available-bg text-status-available"><Check className="size-10" aria-hidden="true" /></div><h2 className="text-xl font-bold text-foreground">تم تسجيل المصروف.</h2><p className="text-sm text-muted-foreground">جارٍ العودة إلى قائمة المصروفات...</p></div>;
  }

  const isSubmitting = mutations.create.isPending;
  const canSubmit = Boolean(category && amount !== "" && expenseDate && !isSubmitting);

  return (
    <div className="min-h-full">
      <PageHeader title="تسجيل مصروف" showBack onBack={() => setLocation("/expenses")} />
      <form className="mx-auto max-w-5xl space-y-4 px-4 pb-24 pt-4 sm:px-6 lg:space-y-5" onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }}>
        {formError && <InlineError className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5">{formError}</InlineError>}

        <FormSection title="تفاصيل المصروف" description="اختر الفئة التي تصف هذا المصروف." contentClassName="md:grid-cols-1">
          <fieldset>
            <legend className="sr-only">فئة المصروف</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {EXPENSE_CATEGORY_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = category === option.value;
                return <button key={option.value} type="button" onClick={() => { setCategory(option.value); clearError("category"); }} className={cn("flex min-h-11 items-center justify-end gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40", isSelected ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-foreground hover:bg-muted/45")}><span>{option.label}</span><Icon className="size-4 shrink-0" aria-hidden="true" /></button>;
              })}
            </div>
            {errors.category && <InlineError className="mt-2">{errors.category}</InlineError>}
          </fieldset>
        </FormSection>

        <FormSection title="القيمة والتاريخ" description="أدخل المبلغ وتاريخ تسجيل المصروف.">
          <FormField label="المبلغ" required hint="USD" error={errors.amount} htmlFor="new-expense-amount"><input id="new-expense-amount" type="number" dir="ltr" inputMode="decimal" min={0} placeholder="50" value={amount} onChange={(event) => { setAmount(event.target.value); clearError("amount"); }} className={errors.amount ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass} /></FormField>
          <FormField label="تاريخ المصروف" required error={errors.expenseDate} htmlFor="new-expense-date"><DatePicker id="new-expense-date" value={expenseDate} onChange={(value) => { setExpenseDate(value); clearError("expenseDate"); }} className={errors.expenseDate ? "border-destructive focus:ring-destructive/30" : undefined} /></FormField>
          <FormField label="الوصف" hint="اختياري" className="md:col-span-2" htmlFor="new-expense-description"><textarea id="new-expense-description" rows={3} className={inputClass} placeholder="أضف وصفاً مختصراً للمصروف" value={description} onChange={(event) => setDescription(event.target.value)} /></FormField>
        </FormSection>

        <FormSection title="ارتباط بالمركبة" description="اختياري — استخدمه عندما يكون المصروف متعلقاً بمركبة محددة." contentClassName="md:grid-cols-1">
          <div className="overflow-hidden rounded-lg border border-border bg-background">
            <button type="button" onClick={() => setShowVehiclePicker((open) => !open)} aria-expanded={showVehiclePicker} aria-controls="expense-vehicle-picker" className="flex w-full items-center justify-between gap-3 p-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
              <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", showVehiclePicker && "rotate-180")} aria-hidden="true" />
              <div className="flex min-w-0 flex-1 items-center justify-end gap-3"><div className="min-w-0 text-right">{selectedVehicle ? <><div dir="ltr" className="truncate text-sm font-semibold text-foreground">{selectedVehicle.make} {selectedVehicle.model}</div><div dir="ltr" className="number-ltr mt-0.5 text-xs text-muted-foreground">{selectedVehicle.plateNumber}</div></> : <><div className="text-sm font-semibold text-foreground">اختيار مركبة</div><div className="mt-0.5 text-xs text-muted-foreground">اترك الحقل فارغاً لتسجيل مصروف عام.</div></>}</div><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Car className="size-5" aria-hidden="true" /></span></div>
            </button>

            {showVehiclePicker && <div id="expense-vehicle-picker" className="space-y-3 border-t border-border p-4"><div className="relative"><Search className="pointer-events-none absolute inset-y-0 start-0 my-auto ms-3 size-4 text-muted-foreground" aria-hidden="true" /><input type="search" dir="auto" placeholder="ابحث باسم المركبة أو رقم اللوحة..." value={vehicleSearch} onChange={(event) => setVehicleSearch(event.target.value)} className={`${inputClass} ps-10`} /></div>{vehiclesLoading ? <div className="flex justify-center py-5"><Spinner className="size-5" /></div> : filteredVehicles.length === 0 ? <p className="py-3 text-center text-sm text-muted-foreground">لا توجد نتائج مطابقة.</p> : <div className="max-h-72 space-y-2 overflow-y-auto pe-1">{filteredVehicles.map((vehicle) => <button key={vehicle.id} type="button" onClick={() => { setSelectedVehicleId(vehicle.id); setShowVehiclePicker(false); }} className={cn("flex w-full items-center gap-3 rounded-lg border p-3 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40", selectedVehicleId === vehicle.id ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/45")}><span className="min-w-0 flex-1 text-right"><span dir="ltr" className="block truncate text-sm font-semibold text-foreground">{vehicle.make} {vehicle.model}</span><span dir="ltr" className="number-ltr mt-0.5 block text-xs text-muted-foreground">{vehicle.plateNumber}</span></span>{selectedVehicleId === vehicle.id && <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />}</button>)}</div>}</div>}
          </div>
        </FormSection>

        <div className="sticky bottom-3 z-10 flex flex-wrap justify-end gap-2 rounded-xl border border-card-border bg-card/95 p-3 shadow-sm backdrop-blur sm:px-4"><Button type="button" variant="outline" onClick={() => setLocation("/expenses")} disabled={isSubmitting}>إلغاء</Button><Button type="submit" disabled={!canSubmit}>{isSubmitting ? "جارٍ الحفظ" : "حفظ المصروف"}</Button></div>
      </form>
    </div>
  );
}
