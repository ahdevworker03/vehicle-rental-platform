import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { ChevronRight, Car, Search, Check } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { FormField, inputClass } from "@/components/ui/FormField";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { EXPENSE_CATEGORY_OPTIONS } from "@/lib/labels";
import { getApiErrorMessage } from "@/lib/api-error";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useListVehicles } from "@workspace/api-client-react";
import type { CreateExpenseRequestCategory } from "@workspace/api-client-react";
import { useExpenseMutations } from "@/features/expenses/hooks";

function toISO(dateStr: string): string {
  return new Date(dateStr + "T12:00:00Z").toISOString();
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
  const debouncedVehicleSearch = useDebouncedValue(vehicleSearch.trim(), 300);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { data: vehiclesData, isLoading: vehiclesLoading } = useListVehicles();
  const vehicles = useMemo(() => vehiclesData?.data ?? [], [vehiclesData]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  const filteredVehicles = useMemo(() => {
    const q = debouncedVehicleSearch.toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        `${v.make} ${v.model}`.toLowerCase().includes(q) ||
        v.plateNumber.toLowerCase().includes(q),
    );
  }, [debouncedVehicleSearch, vehicles]);

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
    if (!category) errs.category = "اختر الفئة";
    if (amount === "" || isNaN(Number(amount))) {
      errs.amount = "أدخل مبلغاً صحيحاً";
    } else if (Number(amount) < 0) {
      errs.amount = "أدخل مبلغاً غير سالب";
    }
    if (!expenseDate) errs.expenseDate = "أدخل تاريخ المصروف";
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
          ...(selectedVehicleId ? { vehicle_id: selectedVehicleId } : {}),
          category: category as CreateExpenseRequestCategory,
          amount: Number(amount),
          expense_date: toISO(expenseDate),
          ...(description.trim() ? { description: description.trim() } : {}),
        },
      });
      setSaved(true);
      setTimeout(() => setLocation("/expenses"), 1200);
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
        <h2 className="text-xl font-bold text-foreground">تم تسجيل المصروف</h2>
        <p className="text-xs text-muted-foreground pt-2">
          جاري العودة إلى قائمة المصروفات...
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="تسجيل مصروف"
        showBack
        onBack={() => setLocation("/expenses")}
      />

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 space-y-4">
        {formError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        {/* ── 1. Category ─────────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4">
          <label className="text-sm font-semibold text-foreground block mb-3 text-right">
            الفئة
            <span className="text-destructive mr-1">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {EXPENSE_CATEGORY_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = category === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => { setCategory(opt.value); clearError("category"); }}
                  className={`flex items-center justify-end gap-2 p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  <span className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {opt.label}
                  </span>
                  <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
                </button>
              );
            })}
          </div>
          {errors.category && (
            <p className="text-xs text-destructive mt-2 text-right">{errors.category}</p>
          )}
        </div>

        {/* ── 2. Amount + Date ────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="المبلغ" required error={errors.amount}>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="مثال: 50"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); clearError("amount"); }}
                className={errors.amount ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
              />
            </FormField>

            <FormField label="تاريخ المصروف" required error={errors.expenseDate}>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => { setExpenseDate(e.target.value); clearError("expenseDate"); }}
                className={errors.expenseDate ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
              />
            </FormField>
          </div>

          <FormField label="الوصف" hint="اختياري">
            <input
              className={inputClass}
              placeholder="وصف المصروف"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>
        </div>

        {/* ── 3. Vehicle (optional) ───────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowVehiclePicker((v) => !v)}
            aria-expanded={showVehiclePicker}
            className="w-full flex items-center justify-between p-4"
          >
            <ChevronRight
              className={`w-4 h-4 text-muted-foreground transition-transform ${
                showVehiclePicker ? "-rotate-90" : ""
              }`}
              strokeWidth={2}
            />
            <div className="flex items-center gap-3 flex-1 justify-end">
              {selectedVehicle ? (
                <div className="text-right">
                  <div className="text-sm font-bold text-foreground">
                    {selectedVehicle.make} {selectedVehicle.model}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedVehicle.plateNumber}
                  </div>
                </div>
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">
                  السيارة (اختياري)
                </span>
              )}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Car className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
            </div>
          </button>

          {showVehiclePicker && (
            <div className="border-t border-border px-4 pt-3 pb-4 space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  type="search"
                  placeholder="ابحث..."
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  className="w-full bg-muted rounded-xl pr-9 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border-none"
                />
              </div>

              {vehiclesLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner className="size-5" />
                </div>
              ) : filteredVehicles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">لا توجد نتائج</p>
              ) : (
                filteredVehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVehicleId(v.id);
                      setShowVehiclePicker(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      selectedVehicleId === v.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background"
                    }`}
                  >
                    <div className="text-right flex-1">
                      <div className="text-sm font-bold text-foreground">
                        {v.make} {v.model}
                      </div>
                      <div className="text-xs text-muted-foreground">{v.plateNumber}</div>
                    </div>
                    {selectedVehicleId === v.id && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={2.5} />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── Save ────────────────────────────────────────────────────── */}
        <button
          onClick={handleSubmit}
          disabled={!category || amount === "" || !expenseDate || isSubmitting}
          className={cn(
            "w-full rounded-2xl py-4 text-base font-bold transition-all shadow-sm flex items-center justify-center gap-2",
            category && amount !== "" && expenseDate && !isSubmitting
              ? "bg-primary text-primary-foreground active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {isSubmitting ? <Spinner /> : "حفظ المصروف"}
        </button>
      </div>
    </>
  );
}
