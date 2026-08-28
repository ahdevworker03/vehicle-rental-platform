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
import { ErrorState, InfoBanner, InlineError, LoadingState } from "@/components/ui/FeedbackState";
import { FormField, inputClass } from "@/components/ui/FormField";
import { DetailSection, SectionCard, SummaryActionPanel } from "@/components/ui/SectionCard";
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
      return { title: "تسجيل الاستلام", dateLabel: "تاريخ ووقت الاستلام الفعلي" };
    case "return":
      return { title: "تأكيد إرجاع المركبة", dateLabel: "تاريخ ووقت الإرجاع الفعلي" };
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
    void queryClient.invalidateQueries({ queryKey: getGetRentalQueryKey(params.id) });
    void queryClient.invalidateQueries({ queryKey: getListRentalsQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
  };

  const pickupMutation = usePickupRental({ mutation: { onSuccess: invalidateRental } });
  const returnMutation = useReturnRental({ mutation: { onSuccess: invalidateRental } });
  const extendMutation = useExtendRental({ mutation: { onSuccess: invalidateRental } });
  const cancelMutation = useCancelRental({ mutation: { onSuccess: invalidateRental } });

  function openAction(action: Action) {
    setActiveAction(action);
    setActionError(null);
    setSuccessMsg(null);
    if (action === "pickup" || action === "return") {
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
        if (!dateValue) return setActionError("أدخل تاريخ ووقت الإرجاع الجديد.");
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

  const isPending = pickupMutation.isPending || returnMutation.isPending || extendMutation.isPending || cancelMutation.isPending;

  if (rentalQuery.isLoading) {
    return (
      <div className="min-h-full">
        <PageHeader title="تفاصيل الإيجار" showBack />
        <div className="px-4 py-4 sm:px-6"><LoadingState rows={6} /></div>
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
            description={rentalQuery.error ? getApiErrorMessage(rentalQuery.error).title : "لم يتم العثور على هذا الإيجار."}
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
      <PageHeader title="تفاصيل الإيجار" showBack />
      <div className="space-y-4 px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        {successMsg && <InfoBanner icon={CheckCircle2}>{successMsg}</InfoBanner>}

        <SectionCard className="shadow-none">
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-medium text-muted-foreground">عقد إيجار</div>
                <h2 className="ui-section-title mt-1">عقد رقم <span className="number-ltr">#{rental.id.slice(0, 8)}</span></h2>
              </div>
              <StatusBadge status={rental.status} />
            </div>
            <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
              <EntityLink
                icon={User}
                eyebrow="العميل"
                title={customer ? `${customer.firstName} ${customer.lastName}` : "جارٍ تحميل العميل"}
                description={customer?.phone ?? ""}
                onClick={customer ? () => setLocation(`/customers/${customer.id}`) : undefined}
              />
              <EntityLink
                icon={Car}
                eyebrow="المركبة"
                title={vehicle ? `${vehicle.make} ${vehicle.model}` : "جارٍ تحميل المركبة"}
                description={vehicle?.plateNumber ?? ""}
                onClick={vehicle ? () => setLocation(`/vehicles/${vehicle.id}`) : undefined}
                dir="ltr"
              />
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-4 xl:grid-cols-12 xl:gap-6">
          <aside className="order-1 space-y-4 xl:order-2 xl:col-span-4">
            <SummaryActionPanel title="حالة العقد وإجراءاته" description="اختر الإجراء المناسب لحالة الإيجار الحالية.">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/45 p-3">
                  <span className="ui-label">حالة الإيجار</span>
                  <StatusBadge status={rental.status} />
                </div>
                {isOwner && activeAction === null && (
                  <RentalActions status={rental.status} onOpen={openAction} />
                )}
                {activeAction && currentAction && (
                  <div className="space-y-4 border-t border-border pt-4">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{currentAction.title}</h3>
                      {activeAction === "cancel" && <p className="ui-secondary-text mt-1">سيتم تحرير المركبة وفقاً لقواعد الإيجار الحالية.</p>}
                    </div>
                    {currentAction.dateLabel && (
                      <FormField label={currentAction.dateLabel} required error={actionError ?? undefined} htmlFor="rental-action-date">
                        <input
                          id="rental-action-date"
                          type="datetime-local"
                          value={dateValue}
                          onChange={(event) => {
                            setDateValue(event.target.value);
                            setActionError(null);
                          }}
                          className={actionError ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
                        />
                      </FormField>
                    )}
                    {actionError && activeAction === "cancel" && <InlineError>{actionError}</InlineError>}
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" onClick={closeAction} disabled={isPending}>إلغاء</Button>
                      <Button type="button" variant={activeAction === "cancel" ? "destructive" : "default"} onClick={submitAction} disabled={isPending}>
                        {isPending ? "جارٍ الحفظ" : "تأكيد"}
                      </Button>
                    </div>
                  </div>
                )}
                {!isOwner && <InfoBanner>لا تملك صلاحية تنفيذ إجراءات العقد.</InfoBanner>}
              </div>
            </SummaryActionPanel>
          </aside>

          <section aria-label="تفاصيل العقد" className="order-2 space-y-4 xl:order-1 xl:col-span-8">
            <DetailSection title="فترة الإيجار" description="تواريخ وأوقات الاستلام والإرجاع.">
              <div className="grid gap-4 sm:grid-cols-2">
                <DateTimeValue label="الاستلام المخطط" value={rental.pickupDate} />
                <DateTimeValue label="الإرجاع المتوقع" value={rental.expectedReturnDate} />
                {rental.actualPickupDate && <DateTimeValue label="الاستلام الفعلي" value={rental.actualPickupDate} />}
                {rental.actualReturnDate && <DateTimeValue label="الإرجاع الفعلي" value={rental.actualReturnDate} />}
              </div>
            </DetailSection>

            <DetailSection title="بيانات العميل">
              {customer ? (
                <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  <KeyValue label="الاسم الكامل" value={`${customer.firstName} ${customer.lastName}`} />
                  <KeyValue label="رقم الجوال" value={customer.phone} numeric />
                  <KeyValue label="رقم الهوية" value={customer.nationalId} numeric />
                  <KeyValue label="رقم الرخصة" value={customer.licenseNumber} numeric />
                  <KeyValue label="انتهاء الرخصة" value={formatDateTime(customer.licenseExpiryDate)} numeric />
                  <KeyValue label="العنوان" value={customer.address} />
                </div>
              ) : (
                <LoadingState rows={2} />
              )}
            </DetailSection>

            <DetailSection title="بيانات المركبة">
              {vehicle ? (
                <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  <KeyValue label="المركبة" value={`${vehicle.make} ${vehicle.model}`} numeric />
                  <KeyValue label="رقم اللوحة" value={vehicle.plateNumber} numeric />
                  <KeyValue label="حالة المركبة" value={<StatusBadge status={vehicle.status} />} />
                  <KeyValue label="عداد المسافة" value={`km ${formatNumber(vehicle.currentMileage)}`} numeric />
                </div>
              ) : (
                <LoadingState rows={2} />
              )}
            </DetailSection>

            <PaymentSection rentalId={rental.id} totalAmount={rental.totalAmount} />
            <ContractSection rentalId={rental.id} />
          </section>
        </div>
      </div>
    </div>
  );
}

function RentalActions({ status, onOpen }: { status: "RESERVED" | "ACTIVE" | "RETURNED" | "CANCELLED"; onOpen: (action: Action) => void }) {
  if (status === "RESERVED") {
    return (
      <div className="grid gap-2">
        <Button type="button" onClick={() => onOpen("pickup")}><PlayCircle className="size-4" aria-hidden="true" />تسجيل الاستلام</Button>
        <Button type="button" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/5" onClick={() => onOpen("cancel")}><X className="size-4" aria-hidden="true" />إلغاء الإيجار</Button>
      </div>
    );
  }

  if (status === "ACTIVE") {
    return (
      <div className="grid gap-2">
        <Button type="button" onClick={() => onOpen("return")}><RotateCcw className="size-4" aria-hidden="true" />إرجاع المركبة</Button>
        <Button type="button" variant="outline" onClick={() => onOpen("extend")}><TimerReset className="size-4" aria-hidden="true" />تمديد الإيجار</Button>
      </div>
    );
  }

  return <InfoBanner icon={ClipboardList}>لا توجد إجراءات متاحة لهذه الحالة.</InfoBanner>;
}

function EntityLink({ icon: Icon, eyebrow, title, description, onClick, dir }: { icon: typeof User; eyebrow: string; title: string; description: string; onClick?: () => void; dir?: "ltr" }) {
  const content = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" aria-hidden="true" /></span>
      <span className="min-w-0">
        <span className="block text-xs text-muted-foreground">{eyebrow}</span>
        <span className="mt-1 block truncate text-sm font-semibold text-foreground" dir={dir}>{title}</span>
        {description && <span className="number-ltr mt-0.5 block truncate text-xs text-muted-foreground">{description}</span>}
      </span>
    </>
  );

  return onClick ? (
    <button type="button" onClick={onClick} className="flex min-w-0 items-center gap-3 rounded-lg text-start transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
      {content}
    </button>
  ) : <div className="flex min-w-0 items-center gap-3">{content}</div>;
}

function DateTimeValue({ label, value }: { label: string; value: string }) {
  return <KeyValue label={label} value={formatDateTime(value)} numeric icon={CalendarDays} />;
}

function KeyValue({ label, value, numeric = false, icon: Icon }: { label: string; value: React.ReactNode; numeric?: boolean; icon?: typeof CalendarDays }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {Icon && <Icon className="size-3.5" aria-hidden="true" />}
        {label}
      </div>
      <div className={`mt-1.5 truncate text-sm font-semibold text-foreground ${numeric ? "number-ltr" : ""}`}>{value}</div>
    </div>
  );
}
