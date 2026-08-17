import { useState } from "react";
import {
  Banknote,
  Wallet,
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { FormField, inputClass } from "@/components/ui/FormField";
import { useAuth } from "@/providers/AuthProvider";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatDateAr } from "@/lib/format";
import { PAYMENT_METHOD_LABELS } from "@/lib/labels";
import type { PaymentResponse } from "@workspace/api-client-react";
import { useRentalPayments, usePaymentMutations } from "@/features/payments/hooks";

interface PaymentSectionProps {
  rentalId: string;
}

function toISO(dateStr: string): string {
  return new Date(dateStr + "T12:00:00Z").toISOString();
}

export function PaymentSection({ rentalId }: PaymentSectionProps) {
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const payments = useRentalPayments(rentalId);
  const mutations = usePaymentMutations(rentalId);

  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [method, setMethod] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
    if (amount === "" || isNaN(Number(amount))) {
      errs.amount = "أدخل مبلغاً صحيحاً";
    } else if (Number(amount) <= 0) {
      errs.amount = "أدخل مبلغاً أكبر من صفر";
    }
    if (!paymentDate) {
      errs.paymentDate = "أدخل تاريخ الدفع";
    }
    if (!method) {
      errs.method = "اختر طريقة الدفع";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (mutations.create.isPending) return;
    if (!validate()) return;

    setFormError(null);

    try {
      await mutations.create.mutateAsync({
        rentalId,
        data: {
          amount: Number(amount),
          payment_date: toISO(paymentDate),
          method: method as PaymentResponse["method"],
        },
      });
      setSuccessMsg("تم تسجيل الدفع بنجاح");
      setShowForm(false);
      setAmount("");
      setPaymentDate("");
      setMethod("");
    } catch (err) {
      setFormError(getApiErrorMessage(err).title);
    }
  }

  const paymentList = payments.data.payments;
  const outstandingBalance = payments.data.outstandingBalance;

  return (
    <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">المدفوعات</h3>
        {isOwner && !showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setSuccessMsg(null);
              setFormError(null);
            }}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary px-3 py-1.5 rounded-lg active:bg-muted/50 transition-colors"
          >
            <Plus className="size-4" />
            تسجيل دفع
          </button>
        )}
      </div>

      {(formError || successMsg) && (
        <div
          className={
            formError
              ? "bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-2.5 text-sm text-destructive flex items-center gap-2"
              : "bg-[hsl(var(--status-available-bg))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--status-available))] flex items-center gap-2"
          }
        >
          {formError ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
          ) : (
            <CheckCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
          )}
          <span>{formError ?? successMsg}</span>
        </div>
      )}

      {payments.isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner />
        </div>
      ) : payments.isError ? (
        <div className="text-sm text-muted-foreground text-center py-6">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
          {payments.error
            ? getApiErrorMessage(payments.error).title
            : "حدث خطأ في تحميل المدفوعات"}
        </div>
      ) : (
        <>
          {/* Outstanding balance */}
          <div className="rounded-xl bg-[hsl(var(--status-maintenance-bg))] px-4 py-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--status-maintenance))]">
              <Wallet className="w-4 h-4" strokeWidth={2} />
              الرصيد المتبقي
            </span>
            <span className="text-base font-bold text-[hsl(var(--status-maintenance))] tabular-nums">
              {formatCurrency(outstandingBalance)}
            </span>
          </div>

          {/* Record payment form */}
          {showForm && isOwner && (
            <div className="rounded-xl border border-border p-3 space-y-3">
              <div className="text-sm font-bold text-foreground text-right">تسجيل دفع</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="المبلغ" required error={errors.amount} htmlFor="payment-amount">
                  <input
                    id="payment-amount"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="مثال: 50"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      clearError("amount");
                    }}
                    className={errors.amount ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
                  />
                </FormField>
                <FormField label="تاريخ الدفع" required error={errors.paymentDate} htmlFor="payment-date">
                  <input
                    id="payment-date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => {
                      setPaymentDate(e.target.value);
                      clearError("paymentDate");
                    }}
                    className={errors.paymentDate ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
                  />
                </FormField>
              </div>
              <FormField label="طريقة الدفع" required error={errors.method} htmlFor="payment-method">
                <select
                  id="payment-method"
                  value={method}
                  onChange={(e) => {
                    setMethod(e.target.value);
                    clearError("method");
                  }}
                  className={errors.method ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
                >
                  <option value="">اختر...</option>
                  <option value="CASH">{PAYMENT_METHOD_LABELS.CASH}</option>
                  <option value="CARD">{PAYMENT_METHOD_LABELS.CARD}</option>
                  <option value="TRANSFER">{PAYMENT_METHOD_LABELS.TRANSFER}</option>
                  <option value="OTHER">{PAYMENT_METHOD_LABELS.OTHER}</option>
                </select>
              </FormField>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  disabled={mutations.create.isPending}
                  className="flex-1 border border-border text-foreground rounded-xl py-3 text-sm font-semibold active:scale-[0.98] transition-transform"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={mutations.create.isPending}
                  className="flex-1 rounded-xl py-3 text-sm font-semibold bg-primary text-primary-foreground active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                  {mutations.create.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Banknote className="size-4" />
                  )}
                  تسجيل الدفع
                </button>
              </div>
            </div>
          )}

          {/* Payment history */}
          {paymentList.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <Banknote className="w-10 h-10 text-muted-foreground mx-auto" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">لا توجد مدفوعات مسجّلة بعد</p>
              {isOwner && !showForm && (
                <button
                  onClick={() => {
                    setShowForm(true);
                    setFormError(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                >
                  <Plus className="size-4" />
                  تسجيل أول دفعة
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {paymentList.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-muted rounded-xl px-3 py-2.5 flex items-center justify-between gap-3"
                >
                  <div className="text-right min-w-0">
                    <div className="text-sm font-bold text-foreground tabular-nums">
                      {formatCurrency(payment.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {formatDateAr(payment.paymentDate)}
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-background text-foreground flex-shrink-0">
                    {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
