import { useState } from "react";
import {
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Loader2,
  Plus,
  Wallet,
} from "lucide-react";
import type { PaymentResponse } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  ErrorState,
  InfoBanner,
  InlineError,
  LoadingState,
} from "@/components/ui/FeedbackState";
import { FormField, inputClass } from "@/components/ui/FormField";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  usePaymentMutations,
  useRentalPayments,
} from "@/features/payments/hooks";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { PAYMENT_METHOD_LABELS } from "@/lib/labels";
import { useAuth } from "@/providers/AuthProvider";

interface PaymentSectionProps {
  rentalId: string;
  totalAmount?: number;
}

function toISO(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00Z`).toISOString();
}

export function PaymentSection({ rentalId, totalAmount }: PaymentSectionProps) {
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
    if (!errors[key]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (amount === "" || Number.isNaN(Number(amount))) {
      nextErrors.amount = "أدخل مبلغاً صحيحاً.";
    } else if (Number(amount) <= 0) {
      nextErrors.amount = "أدخل مبلغاً أكبر من صفر.";
    }
    if (!paymentDate) nextErrors.paymentDate = "أدخل تاريخ الدفع.";
    if (!method) nextErrors.method = "اختر طريقة الدفع.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (mutations.create.isPending || !validate()) return;
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
      setSuccessMsg("تم تسجيل الدفعة.");
      setShowForm(false);
      setAmount("");
      setPaymentDate("");
      setMethod("");
    } catch (error) {
      setFormError(getApiErrorMessage(error).title);
    }
  }

  if (payments.isLoading) {
    return (
      <SectionCard
        title="الفوترة والمدفوعات"
        description="إجمالي العقد، المدفوع، والرصيد المتبقي."
      >
        <LoadingState rows={3} />
      </SectionCard>
    );
  }

  if (payments.isError) {
    return (
      <SectionCard title="الفوترة والمدفوعات">
        <ErrorState
          title="تعذر تحميل المدفوعات"
          description={
            payments.error
              ? getApiErrorMessage(payments.error).title
              : "تعذر تحميل المدفوعات. حاول مرة أخرى."
          }
          onRetry={() => void payments.refetch()}
          className="py-8"
        />
      </SectionCard>
    );
  }

  const paymentList = payments.data.payments;
  const outstandingBalance = payments.data.outstandingBalance;
  const paidAmount = paymentList.reduce(
    (total, payment) => total + payment.amount,
    0,
  );
  const paymentStatus =
    outstandingBalance === 0
      ? "PAID"
      : paidAmount > 0
        ? "PARTIAL"
        : "OUTSTANDING";

  return (
    <SectionCard
      title="المدفوعات"
      description="إجمالي العقد، المدفوع، والرصيد المتبقي."
      action={
        isOwner && !showForm ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowForm(true);
              setFormError(null);
              setSuccessMsg(null);
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
            تسجيل دفعة
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-5">
        {(formError || successMsg) &&
          (formError ? (
            <InlineError>{formError}</InlineError>
          ) : (
            <InfoBanner icon={CheckCircle2}>{successMsg}</InfoBanner>
          ))}

        <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-b border-border pb-5 lg:grid-cols-4">
          {totalAmount !== undefined && (
            <FinanceValue
              label="إجمالي العقد"
              value={formatCurrency(totalAmount)}
            />
          )}
          <FinanceValue
            label="المدفوع"
            value={formatCurrency(paidAmount)}
            tone="positive"
          />
          <FinanceValue
            label="المتبقي"
            value={formatCurrency(outstandingBalance)}
            tone={outstandingBalance > 0 ? "warning" : "positive"}
          />
          <div className="min-w-0 space-y-1.5 text-right">
            <span className="ui-label block">حالة الدفع</span>
            <StatusBadge status={paymentStatus} />
          </div>
        </div>

        {showForm && isOwner && (
          <div className="space-y-4 rounded-lg border border-border bg-muted/35 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CircleDollarSign
                className="size-4 text-primary"
                aria-hidden="true"
              />
              تسجيل دفعة
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="المبلغ"
                required
                error={errors.amount}
                htmlFor="payment-amount"
              >
                <input
                  id="payment-amount"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  placeholder="0"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    clearError("amount");
                  }}
                  className={
                    errors.amount
                      ? `${inputClass} border-destructive focus:ring-destructive/30`
                      : inputClass
                  }
                />
              </FormField>
              <FormField
                label="تاريخ الدفع"
                required
                error={errors.paymentDate}
                htmlFor="payment-date"
              >
                <input
                  id="payment-date"
                  type="date"
                  value={paymentDate}
                  onChange={(event) => {
                    setPaymentDate(event.target.value);
                    clearError("paymentDate");
                  }}
                  className={
                    errors.paymentDate
                      ? `${inputClass} border-destructive focus:ring-destructive/30`
                      : inputClass
                  }
                />
              </FormField>
            </div>
            <FormField
              label="طريقة الدفع"
              required
              error={errors.method}
              htmlFor="payment-method"
            >
              <select
                id="payment-method"
                value={method}
                onChange={(event) => {
                  setMethod(event.target.value);
                  clearError("method");
                }}
                className={
                  errors.method
                    ? `${inputClass} border-destructive focus:ring-destructive/30`
                    : inputClass
                }
              >
                <option value="">اختر طريقة الدفع</option>
                <option value="CASH">{PAYMENT_METHOD_LABELS.CASH}</option>
                <option value="CARD">{PAYMENT_METHOD_LABELS.CARD}</option>
                <option value="TRANSFER">
                  {PAYMENT_METHOD_LABELS.TRANSFER}
                </option>
                <option value="OTHER">{PAYMENT_METHOD_LABELS.OTHER}</option>
              </select>
            </FormField>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={mutations.create.isPending}
              >
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={mutations.create.isPending}
              >
                {mutations.create.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Banknote className="size-4" aria-hidden="true" />
                )}
                تسجيل الدفعة
              </Button>
            </div>
          </div>
        )}

        <div>
          <h3 className="ui-section-title">سجل المدفوعات</h3>
          {paymentList.length === 0 ? (
            <div className="mt-3">
              <InfoBanner icon={Wallet}>
                لا توجد مدفوعات مسجلة. سجّل دفعة عند استلام مبلغ من العميل.
              </InfoBanner>
            </div>
          ) : (
            <div className="mt-3 divide-y divide-border rounded-lg border border-border">
              {paymentList.map((payment) => (
                <div
                  key={payment.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-3 py-3 sm:grid-cols-3 sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">
                      تاريخ الدفع
                    </div>
                    <div className="number-ltr mt-1 text-sm font-medium text-foreground">
                      {formatDateTime(payment.paymentDate)}
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs text-muted-foreground">الطريقة</div>
                    <div className="mt-1 text-sm font-medium text-foreground">
                      {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-xs text-muted-foreground sm:hidden">
                      {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
                    </div>
                    <div className="number-ltr mt-1 text-sm font-bold text-foreground">
                      {formatCurrency(payment.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

function FinanceValue({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "positive" | "warning";
}) {
  return (
    <div className="min-w-0 space-y-1.5 text-right">
      <span className="ui-label">{label}</span>
      <div
        dir="ltr"
        className={`number-ltr truncate text-right text-base font-bold ${tone === "positive" ? "text-status-positive" : tone === "warning" ? "text-status-warning" : "text-foreground"}`}
      >
        {value}
      </div>
    </div>
  );
}
