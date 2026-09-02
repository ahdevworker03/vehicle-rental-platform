import { useState } from "react";
import { useLocation } from "wouter";
import {
  CalendarDays,
  Car,
  CheckCircle2,
  ClipboardList,
  PlayCircle,
  RotateCcw,
  TimerReset,
  User,
  X,
} from "lucide-react";
import {
  getGetRentalQueryKey,
  getListCustomersQueryKey,
  getListRentalsQueryKey,
  getListVehiclesQueryKey,
  useCancelRental,
  useExtendRental,
  useGetCustomer,
  useGetRental,
  useGetVehicle,
  usePickupRental,
  useReturnRental,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ContractSection } from "@/features/contracts";
import { Button } from "@/components/ui/button";
import {
  ErrorState,
  InlineFeedback,
  InlineError,
  LoadingState,
} from "@/components/ui/FeedbackState";
import { FormField, inputClass } from "@/components/ui/FormField";
import { DetailSection } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PaymentSection } from "@/features/payments";
import { PageHeader } from "@/components/layout/PageHeader";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDateTime, formatNumber } from "@/lib/format";
import { useAuth } from "@/providers/AuthProvider";

interface Props {
  params: { id: string };
}

type Action = "pickup" | "return" | "extend" | "cancel";

function toDateTimeLocal(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function actionCopy(action: Action) {
  switch (action) {
    case "pickup":
      return {
        title: "تسجيل الاستلام",
        dateLabel: "تاريخ ووقت الاستلام الفعلي",
      };
    case "return":
      return {
        title: "تأكيد إرجاع المركبة",
        dateLabel: "تاريخ ووقت الإرجاع الفعلي",
      };
    case "extend":
      return { title: "تمديد الإيجار", dateLabel: "تاريخ ووقت الإرجاع الجديد" };
    case "cancel":
      return { title: "تأكيد إلغاء الإيجار", dateLabel: null };
  }
}

export default function RentalDetailPage({ params }: Props) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const [activeAction, setActiveAction] = useState<Action | null>(null);
  const [dateValue, setDateValue] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const rentalQuery = useGetRental(params.id);
  const rental = rentalQuery.data?.data;
  const customerQuery = useGetCustomer(rental?.customerId ?? "");
  const vehicleQuery = useGetVehicle(rental?.vehicleId ?? "");

  const invalidateRental = () => {
    void queryClient.invalidateQueries({
      queryKey: getGetRentalQueryKey(params.id),
    });
    void queryClient.invalidateQueries({ queryKey: getListRentalsQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
    void queryClient.invalidateQueries({
      queryKey: getListCustomersQueryKey(),
    });
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

  function openAction(action: Action) {
    setActiveAction(action);
    setActionError(null);
    setSuccessMsg(null);
    if (action === "pickup" || action === "return") {
      setDateValue(toDateTimeLocal(new Date()));
    } else if (action === "extend") {
      setDateValue(
        rental ? toDateTimeLocal(new Date(rental.expectedReturnDate)) : "",
      );
    }
  }

  function closeAction() {
    setActiveAction(null);
    setActionError(null);
  }

  async function submitAction() {
    if (!rental || !activeAction) return;
    setActionError(null);

    try {
      if (activeAction === "pickup") {
        if (!dateValue) return setActionError("أدخل تاريخ ووقت الاستلام.");
        await pickupMutation.mutateAsync({
          id: rental.id,
          data: { actual_pickup_date: new Date(dateValue).toISOString() },
        });
        setSuccessMsg("تم تسجيل الاستلام.");
      } else if (activeAction === "return") {
        if (!dateValue) return setActionError("أدخل تاريخ ووقت الإرجاع.");
        await returnMutation.mutateAsync({
          id: rental.id,
          data: { actual_return_date: new Date(dateValue).toISOString() },
        });
        setSuccessMsg("تم تسجيل إرجاع المركبة.");
      } else if (activeAction === "extend") {
        if (!dateValue)
          return setActionError("أدخل تاريخ ووقت الإرجاع الجديد.");
        await extendMutation.mutateAsync({
          id: rental.id,
          data: { expected_return_date: new Date(dateValue).toISOString() },
        });
        setSuccessMsg("تم تمديد الإيجار.");
      } else {
        await cancelMutation.mutateAsync({ id: rental.id });
        setSuccessMsg("تم إلغاء الإيجار.");
      }
      setActiveAction(null);
    } catch (error) {
      setActionError(getApiErrorMessage(error).title);
    }
  }

  const isPending =
    pickupMutation.isPending ||
    returnMutation.isPending ||
    extendMutation.isPending ||
    cancelMutation.isPending;

  if (rentalQuery.isLoading) {
    return (
      <div className="min-h-full">
        <PageHeader title="تفاصيل الإيجار" showBack />
        <div className="px-4 py-4 sm:px-6">
          <LoadingState rows={6} />
        </div>
      </div>
    );
  }

  if (rentalQuery.isError || !rental) {
    return (
      <div className="min-h-full">
        <PageHeader title="تفاصيل الإيجار" showBack />
        <div className="px-4 py-4 sm:px-6">
          <ErrorState
            title="تعذر تحميل الإيجار"
            description={
              rentalQuery.error
                ? getApiErrorMessage(rentalQuery.error).title
                : "لم يتم العثور على هذا الإيجار."
            }
            onRetry={() => void rentalQuery.refetch()}
          />
        </div>
      </div>
    );
  }

  const customer = customerQuery.data?.data;
  const vehicle = vehicleQuery.data?.data;
  const currentAction = activeAction ? actionCopy(activeAction) : null;

  return (
    <div className="min-h-full pb-8">
      <PageHeader
        title="تفاصيل الإيجار"
        showBack
        action={
          isOwner && activeAction === null ? (
            <RentalActions status={rental.status} onOpen={openAction} compact />
          ) : undefined
        }
      />
      <div className="space-y-4 px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        {successMsg && (
          <InlineFeedback variant="success" icon={CheckCircle2} onDismiss={() => setSuccessMsg(null)}>{successMsg}</InlineFeedback>
        )}

        <DetailSection className="shadow-none">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryValue label="رقم العقد">
              <span
                dir="ltr"
                className="number-ltr text-sm font-semibold text-foreground"
              >
                #{rental.id.slice(0, 8)}
              </span>
            </SummaryValue>
            <SummaryValue label="حالة الإيجار">
              <StatusBadge status={rental.status} />
            </SummaryValue>
            <SummaryIdentity
              icon={User}
              label="العميل"
              name={
                customer
                  ? `${customer.firstName} ${customer.lastName}`
                  : "جارٍ تحميل العميل"
              }
              identifier={customer?.phone}
              onClick={
                customer
                  ? () => setLocation(`/customers/${customer.id}`)
                  : undefined
              }
            />
            <SummaryIdentity
              icon={Car}
              label="المركبة"
              name={
                vehicle
                  ? `${vehicle.make} ${vehicle.model}`
                  : "جارٍ تحميل المركبة"
              }
              identifier={vehicle?.plateNumber}
              onClick={
                vehicle
                  ? () => setLocation(`/vehicles/${vehicle.id}`)
                  : undefined
              }
              ltrName
            />
          </div>
        </DetailSection>

        {activeAction && currentAction && (
          <DetailSection
            title={currentAction.title}
            description={
              activeAction === "cancel"
                ? "سيتم تحرير المركبة وفقاً لقواعد الإيجار الحالية."
                : undefined
            }
          >
            <div className="space-y-4">
              {currentAction.dateLabel && (
                <FormField
                  label={currentAction.dateLabel}
                  required
                  error={actionError ?? undefined}
                  htmlFor="rental-action-date"
                >
                  <input
                    id="rental-action-date"
                    type="datetime-local"
                    value={dateValue}
                    onChange={(event) => {
                      setDateValue(event.target.value);
                      setActionError(null);
                    }}
                    className={
                      actionError
                        ? `${inputClass} border-destructive focus:ring-destructive/30`
                        : inputClass
                    }
                  />
                </FormField>
              )}
              {actionError && activeAction === "cancel" && (
                <InlineError>{actionError}</InlineError>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeAction}
                  disabled={isPending}
                >
                  إلغاء
                </Button>
                <Button
                  type="button"
                  variant={
                    activeAction === "cancel" ? "destructive" : "default"
                  }
                  onClick={submitAction}
                  disabled={isPending}
                >
                  {isPending ? "جارٍ الحفظ" : "تأكيد"}
                </Button>
              </div>
            </div>
          </DetailSection>
        )}

        {!isOwner && (
          <InlineFeedback variant="info">لا تملك صلاحية تنفيذ إجراءات العقد.</InlineFeedback>
        )}

        <section
          aria-label="تفاصيل العقد"
          className="grid gap-4 lg:grid-cols-2 lg:gap-5"
        >
          <DetailSection
            title="فترة الإيجار"
            description="تواريخ وأوقات الاستلام والإرجاع."
            className="lg:col-span-2"
          >
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              <DateTimeValue
                label="الاستلام المخطط"
                value={rental.pickupDate}
              />
              {rental.actualPickupDate && (
                <DateTimeValue
                  label="الاستلام الفعلي"
                  value={rental.actualPickupDate}
                />
              )}
              <DateTimeValue
                label="الإرجاع المتوقع"
                value={rental.expectedReturnDate}
              />
              {rental.actualReturnDate && (
                <DateTimeValue
                  label="الإرجاع الفعلي"
                  value={rental.actualReturnDate}
                />
              )}
            </div>
          </DetailSection>

          <DetailSection
            title="بيانات العميل"
            description="معلومات التواصل والهوية ورخصة القيادة."
          >
            {customer ? (
              <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                <KeyValue
                  label="الاسم الكامل"
                  value={`${customer.firstName} ${customer.lastName}`}
                />
                <KeyValue label="رقم الهاتف" value={customer.phone} numeric />
                <KeyValue
                  label="رقم الهوية"
                  value={customer.nationalId}
                  numeric
                />
                <KeyValue
                  label="رقم الرخصة"
                  value={customer.licenseNumber}
                  numeric
                />
                <KeyValue
                  label="انتهاء الرخصة"
                  value={formatDateTime(customer.licenseExpiryDate)}
                  numeric
                />
                <KeyValue label="العنوان" value={customer.address} />
              </div>
            ) : (
              <LoadingState rows={2} />
            )}
          </DetailSection>

          <DetailSection
            title="بيانات المركبة"
            description="الهوية والمواصفات الأساسية للمركبة."
          >
            {vehicle ? (
              <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                <KeyValue label="الشركة المصنعة" value={vehicle.make} ltr />
                <KeyValue label="الطراز" value={vehicle.model} ltr />
                <KeyValue label="رقم اللوحة" value={vehicle.plateNumber} ltr />
                <KeyValue
                  label="حالة المركبة"
                  value={<StatusBadge status={vehicle.status} />}
                />
                <KeyValue
                  label="العداد الحالي"
                  value={`${formatNumber(vehicle.currentMileage)} كم`}
                  numeric
                />
                <KeyValue label="سنة الصنع" value={vehicle.year} numeric />
                <KeyValue label="اللون" value={vehicle.color} />
              </div>
            ) : (
              <LoadingState rows={2} />
            )}
          </DetailSection>
        </section>

        <PaymentSection rentalId={rental.id} totalAmount={rental.totalAmount} />
        <ContractSection rentalId={rental.id} />
      </div>
    </div>
  );
}

function RentalActions({
  status,
  onOpen,
  compact = false,
}: {
  status: "RESERVED" | "ACTIVE" | "RETURNED" | "CANCELLED";
  onOpen: (action: Action) => void;
  compact?: boolean;
}) {
  const className = compact ? "flex flex-wrap justify-end gap-2" : "grid gap-2";
  const size = compact ? "sm" : undefined;

  if (status === "RESERVED") {
    return (
      <div className={className}>
        <Button type="button" size={size} onClick={() => onOpen("pickup")}>
          <PlayCircle className="size-4" aria-hidden="true" />
          تسجيل الاستلام
        </Button>
        <Button
          type="button"
          size={size}
          variant="outline"
          className="border-destructive/40 text-destructive hover:bg-destructive/5"
          onClick={() => onOpen("cancel")}
        >
          <X className="size-4" aria-hidden="true" />
          إلغاء الإيجار
        </Button>
      </div>
    );
  }

  if (status === "ACTIVE") {
    return (
      <div className={className}>
        <Button type="button" size={size} onClick={() => onOpen("return")}>
          <RotateCcw className="size-4" aria-hidden="true" />
          إرجاع المركبة
        </Button>
        <Button
          type="button"
          size={size}
          variant="outline"
          onClick={() => onOpen("extend")}
        >
          <TimerReset className="size-4" aria-hidden="true" />
          تمديد الإيجار
        </Button>
      </div>
    );
  }

  return compact ? null : (
    <InlineFeedback variant="info" icon={ClipboardList}>
      لا توجد إجراءات متاحة لهذه الحالة.
    </InlineFeedback>
  );
}

function SummaryValue({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1.5 text-right">
      <div className="ui-label">{label}</div>
      {children}
    </div>
  );
}

function SummaryIdentity({
  icon: Icon,
  label,
  name,
  identifier,
  onClick,
  ltrName = false,
}: {
  icon: typeof User;
  label: string;
  name: string;
  identifier?: string;
  onClick?: () => void;
  ltrName?: boolean;
}) {
  const content = (
    <>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 text-right">
        <span className="block text-xs text-muted-foreground">{label}</span>
        <span
          className="mt-1 block truncate text-sm font-semibold text-foreground"
          dir={ltrName ? "ltr" : "auto"}
        >
          {name}
        </span>
        {identifier && (
          <span
            dir="ltr"
            className="number-ltr mt-0.5 block truncate text-right text-xs text-muted-foreground"
          >
            {identifier}
          </span>
        )}
      </span>
    </>
  );

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 items-center gap-2.5 rounded-lg text-start transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      {content}
    </button>
  ) : (
    <div className="flex min-w-0 items-center gap-2.5">{content}</div>
  );
}

function DateTimeValue({ label, value }: { label: string; value: string }) {
  return (
    <KeyValue
      label={label}
      value={formatDateTime(value)}
      numeric
      icon={CalendarDays}
    />
  );
}

function KeyValue({
  label,
  value,
  numeric = false,
  ltr = false,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  numeric?: boolean;
  ltr?: boolean;
  icon?: typeof CalendarDays;
}) {
  return (
    <div className="min-w-0 text-right">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {Icon && <Icon className="size-3.5" aria-hidden="true" />}
        {label}
      </div>
      <div
        dir={ltr || numeric ? "ltr" : undefined}
        className={`mt-1.5 break-words text-sm font-semibold text-foreground ${numeric ? "number-ltr" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
