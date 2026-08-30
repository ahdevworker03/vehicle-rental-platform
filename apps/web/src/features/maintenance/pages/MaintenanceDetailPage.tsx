import { useState } from "react";
import { useLocation } from "wouter";
import { Car, CheckCircle2, Package, StickyNote } from "lucide-react";
import { useGetVehicle } from "@workspace/api-client-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ErrorState, InfoBanner, LoadingState } from "@/components/ui/FeedbackState";
import { FormField, inputClass } from "@/components/ui/FormField";
import { DetailSection } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMaintenanceMutations, useMaintenanceRecord } from "@/features/maintenance/hooks";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDate, formatDateTime, formatUsd } from "@/lib/format";
import { MAINTENANCE_TYPES } from "@/lib/labels";
import { useAuth } from "@/providers/AuthProvider";

interface DetailPageParams {
  params: { id: string };
}

function KeyValue({ label, value, numeric = false }: { label: string; value?: string | null; numeric?: boolean }) {
  return <div className="min-w-0 text-right"><div className="ui-label">{label}</div><div dir={numeric ? "ltr" : undefined} className={`mt-1.5 break-words text-right text-sm font-semibold text-foreground ${numeric ? "number-ltr" : ""}`}>{value || "—"}</div></div>;
}

export default function MaintenanceDetailPage({ params }: DetailPageParams) {
  const { id } = params;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const maintenanceQuery = useMaintenanceRecord(id);
  const record = maintenanceQuery.data?.data;
  const vehicleQuery = useGetVehicle(record?.vehicleId ?? "");
  const mutations = useMaintenanceMutations();
  const [completing, setCompleting] = useState(false);
  const [cost, setCost] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleComplete() {
    if (!record) return;
    setActionError(null);
    const finalCost = Number(cost);
    if (!cost || Number.isNaN(finalCost) || finalCost < 0) {
      setActionError("أدخل تكلفة نهائية غير سالبة.");
      return;
    }
    try {
      await mutations.complete.mutateAsync({ id: record.id, data: { cost: finalCost } });
      setSuccessMessage("تم إكمال الصيانة.");
      setCompleting(false);
    } catch (error) {
      setActionError(getApiErrorMessage(error).title);
    }
  }

  if (maintenanceQuery.isLoading) return <div className="min-h-full"><PageHeader title="تفاصيل الصيانة" showBack /><div className="px-4 py-6 sm:px-6"><LoadingState rows={5} /></div></div>;
  if (maintenanceQuery.isError || !record) return <div className="min-h-full"><PageHeader title="تفاصيل الصيانة" showBack /><div className="px-4 py-6 sm:px-6"><ErrorState title="تعذر تحميل سجل الصيانة" description={maintenanceQuery.error ? getApiErrorMessage(maintenanceQuery.error).title : "لم يتم العثور على هذا السجل."} onRetry={() => void maintenanceQuery.refetch()} /></div></div>;

  const vehicle = vehicleQuery.data?.data;
  const type = MAINTENANCE_TYPES[record.type];
  const TypeIcon = type.icon;

  return (
    <div className="min-h-full pb-8">
      <PageHeader title="تفاصيل الصيانة" showBack action={<StatusBadge status={record.status} />} />
      <div className="space-y-4 px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        {successMessage && <InfoBanner icon={CheckCircle2}>{successMessage}</InfoBanner>}

        <DetailSection className="shadow-none">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3"><span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-status-warning-bg text-status-warning"><TypeIcon className="size-7" aria-hidden="true" /></span><div className="min-w-0"><div className="text-xs font-medium text-muted-foreground">سجل صيانة</div><h2 className="truncate text-lg font-bold text-foreground">{type.label}</h2><div className="number-ltr mt-1 text-xs text-muted-foreground">#{record.id.slice(0, 8)}</div></div></div>
          </div>
        </DetailSection>

        <section aria-label="بيانات الصيانة" className="space-y-4">
            <DetailSection title="المركبة" description="المركبة المرتبط بها سجل الصيانة.">
              <div className="flex items-center gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Car className="size-5" aria-hidden="true" /></span><div className="min-w-0">{vehicle ? <button type="button" onClick={() => setLocation(`/vehicles/${vehicle.id}`)} className="block truncate text-start text-base font-semibold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">{vehicle.make} {vehicle.model}</button> : <span className="text-sm text-muted-foreground">جارٍ تحميل المركبة</span>}{vehicle && <div dir="ltr" className="number-ltr mt-1 text-sm text-muted-foreground">{vehicle.plateNumber}</div>}</div></div>
            </DetailSection>

            <DetailSection title="تفاصيل الصيانة" description="النوع والموعد وتفاصيل التنفيذ والتكلفة.">
              <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                <KeyValue label="نوع الصيانة" value={type.label} />
                <KeyValue label="تاريخ الصيانة" value={formatDate(record.maintenanceDate)} numeric />
                <KeyValue label="تاريخ الإنجاز" value={record.completedAt ? formatDateTime(record.completedAt) : null} numeric />
                <KeyValue label="التكلفة" value={record.cost == null ? null : formatUsd(record.cost)} numeric />
                <KeyValue label="الورشة / المزوّد" value={record.vendor} />
              </div>
            </DetailSection>

            <DetailSection title="إجراءات الصيانة" description="أكمل السجل عند انتهاء العمل.">
              {isOwner && record.status !== "COMPLETED" && (completing ? (
                <div className="max-w-xl space-y-3">
                  <FormField label="التكلفة النهائية" required hint="USD · رقم غير سالب" error={actionError ?? undefined} htmlFor="maintenance-completion-cost"><input id="maintenance-completion-cost" type="number" dir="ltr" inputMode="decimal" min={0} placeholder="150" value={cost} onChange={(event) => { setCost(event.target.value); setActionError(null); }} className={actionError ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass} /></FormField>
                  <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => { setCompleting(false); setActionError(null); }} disabled={mutations.complete.isPending}>إلغاء</Button><Button type="button" onClick={handleComplete} disabled={mutations.complete.isPending}>{mutations.complete.isPending ? "جارٍ الحفظ" : "تأكيد الإكمال"}</Button></div>
                </div>
              ) : <Button type="button" onClick={() => { setCompleting(true); setActionError(null); }}><CheckCircle2 className="size-4" aria-hidden="true" />إكمال الصيانة</Button>)}
              {!isOwner && record.status !== "COMPLETED" && <InfoBanner>لا تملك صلاحية إكمال الصيانة.</InfoBanner>}
              {record.status === "COMPLETED" && <p className="ui-secondary-text">تم إكمال هذا السجل.</p>}
            </DetailSection>

            {record.replacedParts && record.replacedParts.length > 0 && <DetailSection title="القطع المبدلة" description="القطع المسجّلة ضمن أعمال الصيانة."><div className="divide-y divide-border">{record.replacedParts.map((part, index) => <div key={`${part.name}-${index}`} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><div className="flex items-center gap-2 text-sm font-semibold text-foreground"><Package className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />{part.name}</div><div className="mt-1 text-xs text-muted-foreground">{part.brand || "من دون ماركة"}{part.quantity ? ` · الكمية ${part.quantity}` : ""}</div></div><span className="number-ltr text-sm font-semibold text-foreground">{part.unitCost == null ? "—" : formatUsd(part.unitCost)}</span></div>)}</div></DetailSection>}

            {record.notes && <DetailSection title="ملاحظات"><div className="flex items-start gap-2"><StickyNote className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{record.notes}</p></div></DetailSection>}
        </section>
      </div>
    </div>
  );
}
