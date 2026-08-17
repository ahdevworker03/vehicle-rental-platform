import { useState } from "react";
import { useLocation } from "wouter";
import {
  Car,
  Calendar,
  CheckCircle,
  RotateCcw,
  PlayCircle,
  TimerReset,
  X,
  AlertCircle,
  User,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { InfoRow } from "@/components/ui/InfoRow";
import { FormField, inputClass } from "@/components/ui/FormField";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ContractSection } from "@/components/ui/ContractSection";
import { PaymentSection } from "@/components/ui/PaymentSection";
import { RENTAL_STATUS_LABELS } from "@/lib/rental-labels";
import { formatCurrency, formatDateAr } from "@/lib/format";
import {
  useGetRental,
  useGetCustomer,
  useGetVehicle,
  usePickupRental,
  useReturnRental,
  useExtendRental,
  useCancelRental,
  getGetRentalQueryKey,
  getListRentalsQueryKey,
  getListVehiclesQueryKey,
  getListCustomersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

interface Props {
  params: { id: string };
}

type Action = "pickup" | "return" | "extend" | "cancel";

const statusBadgeClass: Record<string, string> = {
  RESERVED: "bg-[hsl(var(--status-maintenance-bg))] text-[hsl(var(--status-maintenance))]",
  ACTIVE: "bg-[hsl(var(--status-rented-bg))] text-[hsl(var(--status-rented))]",
  RETURNED: "bg-[hsl(var(--status-available-bg))] text-[hsl(var(--status-available))]",
  CANCELLED: "bg-[hsl(var(--status-danger-bg))] text-[hsl(var(--status-danger))]",
};

function toDateTimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function RentalDetailPage({ params }: Props) {
  const id = params.id;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const queryClient = useQueryClient();

  const [activeAction, setActiveAction] = useState<Action | null>(null);
  const [dateValue, setDateValue] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useGetRental(id);
  const { data: customerData } = useGetCustomer(data?.data?.customerId ?? "");
  const { data: vehicleData } = useGetVehicle(data?.data?.vehicleId ?? "");

  const invalidateRental = () => {
    void queryClient.invalidateQueries({ queryKey: getGetRentalQueryKey(id) });
    void queryClient.invalidateQueries({ queryKey: getListRentalsQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
  };

  const pickupMutation = usePickupRental({
    mutation: { onSuccess: invalidateRental },
  });
  const returnMutation = useReturnRental({
    mutation: { onSuccess: invalidateRental },
  });
  const extendMutation = useExtendRental({
    mutation: { onSuccess: invalidateRental },
  });
  const cancelMutation = useCancelRental({
    mutation: { onSuccess: invalidateRental },
  });

  const rental = data?.data;

  function openAction(action: Action) {
    setActiveAction(action);
    setActionError(null);
    setSuccessMsg(null);
    if (action === "pickup") {
      setDateValue(toDateTimeLocal(new Date()));
    } else if (action === "return") {
      setDateValue(toDateTimeLocal(new Date()));
    } else if (action === "extend") {
      setDateValue(rental ? toDateTimeLocal(new Date(rental.expectedReturnDate)) : "");
    }
  }

  function closeAction() {
    setActiveAction(null);
    setActionError(null);
  }

  async function submitAction() {
    if (!rental) return;

    setActionError(null);

    try {
      if (activeAction === "pickup") {
        if (!dateValue) {
          setActionError("أدخل تاريخ الاستلام");
          return;
        }
        await pickupMutation.mutateAsync({
          id: rental.id,
          data: { actual_pickup_date: new Date(dateValue).toISOString() },
        });
        setSuccessMsg("تم تسجيل الاستلام بنجاح");
      } else if (activeAction === "return") {
        if (!dateValue) {
          setActionError("أدخل تاريخ الإعادة");
          return;
        }
        await returnMutation.mutateAsync({
          id: rental.id,
          data: { actual_return_date: new Date(dateValue).toISOString() },
        });
        setSuccessMsg("تم تسجيل الإعادة بنجاح");
      } else if (activeAction === "extend") {
        if (!dateValue) {
          setActionError("أدخل تاريخ الإرجاع الجديد");
          return;
        }
        await extendMutation.mutateAsync({
          id: rental.id,
          data: { expected_return_date: new Date(dateValue).toISOString() },
        });
        setSuccessMsg("تم تمديد الإيجار بنجاح");
      } else if (activeAction === "cancel") {
        await cancelMutation.mutateAsync({ id: rental.id });
        setSuccessMsg("تم إلغاء الإيجار");
      }
      setActiveAction(null);
    } catch (err) {
      setActionError(getApiErrorMessage(err).title);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !rental) {
    return (
      <div className="min-h-full">
        <PageHeader title="تفاصيل الإيجار" showBack />
        <EmptyState
          icon={AlertCircle}
          title="لا توجد بيانات"
          description={error ? getApiErrorMessage(error).title : "لم يتم العثور على هذا الإيجار"}
          className="py-16"
        />
      </div>
    );
  }

  const customer = customerData?.data;
  const vehicle = vehicleData?.data;

  const isPending = pickupMutation.isPending || returnMutation.isPending || extendMutation.isPending || cancelMutation.isPending;

  return (
    <div className="min-h-full pb-8">
      <PageHeader title="تفاصيل الإيجار" showBack />

      {successMsg && (
        <div className="mx-4 mt-3 px-4 py-3 rounded-xl bg-[hsl(var(--status-available-bg))] text-[hsl(var(--status-available))] text-sm font-semibold flex items-center gap-2 justify-end">
          <span>{successMsg}</span>
          <CheckCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">
        {/* Status banner */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 flex items-center justify-between">
          <span className={cn("text-sm font-bold px-3 py-1 rounded-full", statusBadgeClass[rental.status])}>
            {RENTAL_STATUS_LABELS[rental.status] ?? rental.status}
          </span>
          <span className="text-xs text-muted-foreground">
            #{rental.id.slice(0, 8)}
          </span>
        </div>

        {/* ── Main content + side panel ─────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-5 lg:items-start">
          {/* Main column: dates/pricing + contract */}
          <div className="space-y-4 lg:col-span-3">

        {/* Rental info */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm px-4 py-2">
          <InfoRow
            label="تاريخ الاستلام المخطط"
            value={
              <span className="flex items-center gap-1.5">
                {formatDateAr(rental.pickupDate)}
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
              </span>
            }
          />
          <InfoRow
            label="تاريخ الإرجاع المتوقع"
            value={
              <span className="flex items-center gap-1.5">
                {formatDateAr(rental.expectedReturnDate)}
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
              </span>
            }
          />
          {rental.actualPickupDate && (
            <InfoRow label="الاستلام الفعلي" value={formatDateAr(rental.actualPickupDate)} />
          )}
          {rental.actualReturnDate && (
            <InfoRow label="الإعادة الفعلية" value={formatDateAr(rental.actualReturnDate)} />
          )}
          <InfoRow label="الأجرة اليومية" value={formatCurrency(rental.dailyRate)} />
          <InfoRow
            label="الإجمالي"
            value={<span className="font-bold text-foreground">{formatCurrency(rental.totalAmount)}</span>}
          />
          <InfoRow label="التأمين" value={formatCurrency(rental.depositAmount)} />
        </div>

        {/* Contract */}
        <ContractSection rentalId={rental.id} />

        {/* Payments */}
        <PaymentSection rentalId={rental.id} />

          </div>

          {/* Side column: customer + vehicle + actions */}
          <div className="space-y-4 lg:col-span-2">

        {/* Customer */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4">
          <div className="text-xs font-semibold text-muted-foreground mb-3 text-right">العميل</div>
          <div className="flex items-center justify-between gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="text-right flex-1">
              {customer ? (
                <button
                  onClick={() => setLocation(`/customers/${customer.id}`)}
                  className="text-base font-bold text-foreground hover:text-primary active:text-primary/80 transition-colors"
                >
                  {customer.firstName} {customer.lastName}
                </button>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
              {customer && (
                <div className="text-sm text-muted-foreground">{customer.phone}</div>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4">
          <div className="text-xs font-semibold text-muted-foreground mb-3 text-right">السيارة</div>
          <div className="flex items-center justify-between gap-3">
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
              <Car className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
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
                <span className="text-sm text-muted-foreground">—</span>
              )}
              {vehicle && (
                <div className="text-sm text-muted-foreground">{vehicle.plateNumber}</div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons — status-based */}
        {isOwner && activeAction === null && (
          <div className="space-y-3 pt-1">
            {rental.status === "RESERVED" && (
              <>
                <button
                  onClick={() => openAction("pickup")}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-4 text-base font-bold active:scale-[0.98] transition-transform shadow-sm"
                >
                  <PlayCircle className="w-5 h-5" strokeWidth={2} />
                  تسجيل الاستلام
                </button>
                <button
                  onClick={() => openAction("cancel")}
                  className="w-full flex items-center justify-center gap-2 border border-destructive/30 bg-destructive/5 text-destructive rounded-2xl py-4 text-base font-bold active:scale-[0.98] transition-transform"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                  إلغاء الإيجار
                </button>
              </>
            )}

            {rental.status === "ACTIVE" && (
              <>
                <button
                  onClick={() => openAction("return")}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-4 text-base font-bold active:scale-[0.98] transition-transform shadow-sm"
                >
                  <RotateCcw className="w-5 h-5" strokeWidth={2} />
                  إعادة السيارة
                </button>
                <button
                  onClick={() => openAction("extend")}
                  className="w-full flex items-center justify-center gap-2 border-2 border-primary text-primary rounded-2xl py-4 text-base font-bold active:scale-[0.98] transition-transform"
                >
                  <TimerReset className="w-5 h-5" strokeWidth={2} />
                  تمديد الإيجار
                </button>
              </>
            )}
          </div>
        )}

        {/* Action panel */}
        {activeAction !== null && (
          <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-3">
            <div className="text-sm font-bold text-foreground text-right">
              {activeAction === "pickup" && "تسجيل الاستلام"}
              {activeAction === "return" && "تأكيد إعادة السيارة"}
              {activeAction === "extend" && "تمديد الإيجار"}
              {activeAction === "cancel" && "تأكيد إلغاء الإيجار"}
            </div>

            {activeAction === "cancel" ? (
              <p className="text-sm text-muted-foreground text-right">
                هل أنت متأكد من إلغاء هذا الإيجار؟ سيتم تحرير السيارة تلقائياً.
              </p>
            ) : (
              <FormField
                label={
                  activeAction === "pickup"
                    ? "تاريخ الاستلام الفعلي"
                    : activeAction === "return"
                      ? "تاريخ الإعادة الفعلي"
                      : "تاريخ الإرجاع الجديد"
                }
                required
                error={actionError ?? undefined}
              >
                <input
                  type="datetime-local"
                  value={dateValue}
                  onChange={(e) => {
                    setDateValue(e.target.value);
                    setActionError(null);
                  }}
                  className={actionError ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
                />
              </FormField>
            )}

            {actionError && activeAction === "cancel" && (
              <p className="text-xs text-destructive text-right">{actionError}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={closeAction}
                disabled={isPending}
                className="flex-1 border border-border text-foreground rounded-xl py-3 text-sm font-semibold active:scale-[0.98] transition-transform"
              >
                إلغاء
              </button>
              <button
                onClick={submitAction}
                disabled={isPending}
                className={cn(
                  "flex-1 rounded-xl py-3 text-sm font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-2",
                  activeAction === "cancel"
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-primary text-primary-foreground"
                )}
              >
                {isPending ? <Spinner /> : "تأكيد"}
              </button>
            </div>
          </div>
        )}

          </div>
        </div>
      </div>
    </div>
  );
}
