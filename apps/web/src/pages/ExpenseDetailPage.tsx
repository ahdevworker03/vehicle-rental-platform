import { useState } from "react";
import { useLocation } from "wouter";
import { Car, Wallet, AlertCircle, Calendar, Banknote, StickyNote, Pencil } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { InfoRow } from "@/components/ui/InfoRow";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField, inputClass } from "@/components/ui/FormField";
import { formatCurrency, formatDateAr } from "@/lib/format";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/labels";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthProvider";
import { useGetVehicle } from "@workspace/api-client-react";
import { useExpense, useExpenseMutations } from "@/features/expenses/hooks";

interface DetailPageParams {
  params: { id: string };
}

export default function ExpenseDetailPage({ params }: DetailPageParams) {
  const id = params.id;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";

  const { data, isLoading, isError, error } = useExpense(id);
  const { data: vehicleData } = useGetVehicle(data?.data?.vehicleId ?? "");
  const mutations = useExpenseMutations();

  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const expense = data?.data;

  function beginEdit() {
    if (!expense) return;
    setCategory(expense.category);
    setAmount(String(expense.amount));
    setExpenseDate(expense.expenseDate.slice(0, 10));
    setDescription(expense.description ?? "");
    setFormError(null);
    setEditing(true);
  }

  async function handleSave() {
    if (!expense) return;
    setFormError(null);

    const numericAmount = Number(amount);
    if (amount === "" || isNaN(numericAmount) || numericAmount < 0) {
      setFormError("أدخل مبلغاً غير سالب");
      return;
    }
    if (!expenseDate) {
      setFormError("أدخل تاريخ المصروف");
      return;
    }

    try {
      await mutations.update.mutateAsync({
        id: expense.id,
        data: {
          category: category as typeof expense.category,
          amount: numericAmount,
          expense_date: new Date(expenseDate + "T12:00:00Z").toISOString(),
          ...(description.trim() ? { description: description.trim() } : { description: null }),
        },
      });
      setEditing(false);
      setSuccessMsg("تم تحديث المصروف");
    } catch (err) {
      setFormError(getApiErrorMessage(err).title);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !expense) {
    return (
      <div className="min-h-full">
        <PageHeader title="تفاصيل المصروف" showBack />
        <EmptyState
          icon={AlertCircle}
          title="لا توجد بيانات"
          description={error ? getApiErrorMessage(error).title : "لم يتم العثور على هذا المصروف"}
          className="py-16"
        />
      </div>
    );
  }

  const vehicle = vehicleData?.data;
  const categoryConfig = EXPENSE_CATEGORY_LABELS[expense.category];

  return (
    <div className="min-h-full pb-8">
      <PageHeader
        title="تفاصيل المصروف"
        showBack
        action={
          isOwner && !editing ? (
            <button
              onClick={beginEdit}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-95 transition-transform"
              aria-label="تعديل المصروف"
            >
              <Pencil className="w-4 h-4" strokeWidth={2} />
            </button>
          ) : undefined
        }
      />

      {successMsg && (
        <div className="mx-4 mt-3 px-4 py-3 rounded-xl bg-[hsl(var(--status-available-bg))] text-[hsl(var(--status-available))] text-sm font-semibold flex items-center gap-2 justify-end">
          <span>{successMsg}</span>
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">
        {/* Header card */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-[hsl(var(--status-maintenance-bg))] flex items-center justify-center flex-shrink-0">
            <Wallet className="w-7 h-7 text-[hsl(var(--status-maintenance))]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-base font-bold text-foreground truncate">
                {categoryConfig.label}
              </span>
              <span className="text-base font-bold text-foreground tabular-nums">
                {formatCurrency(expense.amount)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {expense.id.slice(0, 8)}
            </div>
          </div>
        </div>

        {editing ? (
          <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-4">
            {formError && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            <FormField label="الفئة" required>
              <select
                className={inputClass}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {(Object.keys(EXPENSE_CATEGORY_LABELS) as Array<keyof typeof EXPENSE_CATEGORY_LABELS>).map((c) => (
                  <option key={c} value={c}>{EXPENSE_CATEGORY_LABELS[c].label}</option>
                ))}
              </select>
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="المبلغ" required>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={inputClass}
                />
              </FormField>
              <FormField label="تاريخ المصروف" required>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className={inputClass}
                />
              </FormField>
            </div>
            <FormField label="الوصف" hint="اختياري">
              <input
                className={inputClass}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormField>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                disabled={mutations.update.isPending}
                className="flex-1 border border-border text-foreground rounded-xl py-3 text-sm font-semibold active:scale-[0.98] transition-transform"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={mutations.update.isPending}
                className="flex-1 rounded-xl py-3 text-sm font-semibold bg-primary text-primary-foreground active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                {mutations.update.isPending ? <Spinner /> : "حفظ"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Vehicle */}
            <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4">
              <div className="text-xs font-semibold text-muted-foreground mb-3 text-right">السيارة</div>
              <div className="flex items-center justify-between gap-3">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Car className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div className="text-right flex-1">
                  {vehicle ? (
                    <button
                      onClick={() => setLocation(`/vehicles/${vehicle.id}`)}
                      className="text-base font-bold text-foreground hover:text-primary active:text-primary/80 transition-colors"
                    >
                      {vehicle.make} {vehicle.model}
                    </button>
                  ) : (
                    <span className="text-sm text-muted-foreground">مصروف عام (بدون سيارة)</span>
                  )}
                  {vehicle && (
                    <div className="text-sm text-muted-foreground">{vehicle.plateNumber}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-card rounded-2xl border border-card-border shadow-sm px-4 py-2">
              <InfoRow label="الفئة" value={categoryConfig.label} />
              <InfoRow
                label="المبلغ"
                value={
                  <span className="flex items-center gap-1.5 font-bold text-foreground">
                    {formatCurrency(expense.amount)}
                    <Banknote className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                  </span>
                }
              />
              <InfoRow
                label="تاريخ المصروف"
                value={
                  <span className="flex items-center gap-1.5">
                    {formatDateAr(expense.expenseDate)}
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                  </span>
                }
              />
            </div>

            {/* Description */}
            {expense.description && (
              <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                  <h3 className="text-sm font-bold text-foreground">الوصف</h3>
                </div>
                <p className="text-sm text-foreground text-right">{expense.description}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
