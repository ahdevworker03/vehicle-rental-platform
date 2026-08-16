import { useState } from "react";
import { useLocation } from "wouter";
import { Car, Wrench, CheckCircle, AlertCircle, Banknote, Calendar, Package, StickyNote, Store } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { InfoRow } from "@/components/ui/InfoRow";
import { FormField, inputClass } from "@/components/ui/FormField";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDateAr } from "@/lib/format";
import { MAINTENANCE_TYPES, MAINTENANCE_STATUS_LABELS } from "@/lib/labels";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthProvider";
import { useGetVehicle } from "@workspace/api-client-react";
import { useMaintenanceRecord, useMaintenanceMutations } from "@/features/maintenance/hooks";
import type { MaintenanceResponse } from "@workspace/api-client-react";

interface DetailPageParams {
  params: { id: string };
}

const statusBadgeClass: Record<MaintenanceResponse["status"], string> = {
  SCHEDULED: "bg-[hsl(var(--status-maintenance-bg))] text-[hsl(var(--status-maintenance))]",
  IN_PROGRESS: "bg-[hsl(var(--status-rented-bg))] text-[hsl(var(--status-rented))]",
  COMPLETED: "bg-[hsl(var(--status-available-bg))] text-[hsl(var(--status-available))]",
};

export default function MaintenanceDetailPage({ params }: DetailPageParams) {
  const id = params.id;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";

  const { data, isLoading, isError, error } = useMaintenanceRecord(id);
  const { data: vehicleData } = useGetVehicle(data?.data?.vehicleId ?? "");
  const mutations = useMaintenanceMutations();

  const [completing, setCompleting] = useState(false);
  const [cost, setCost] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const record = data?.data;

  async function handleComplete() {
    if (!record) return;
    setActionError(null);

    const finalCost = Number(cost);
    if (!cost || isNaN(finalCost) || finalCost < 0) {
      setActionError("أدخل تكلفة غير سالبة");
      return;
    }

    try {
      await mutations.complete.mutateAsync({
        id: record.id,
        data: { cost: finalCost },
      });
      setSuccessMsg("تم إكمال الصيانة بنجاح");
      setCompleting(false);
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

  if (isError || !record) {
    return (
      <div className="min-h-full">
        <PageHeader title="تفاصيل الصيانة" showBack />
        <EmptyState
          icon={AlertCircle}
          title="لا توجد بيانات"
          description={error ? getApiErrorMessage(error).title : "لم يتم العثور على هذا السجل"}
          className="py-16"
        />
      </div>
    );
  }

  const vehicle = vehicleData?.data;
  const typeConfig = MAINTENANCE_TYPES[record.type];

  return (
    <div className="min-h-full pb-8">
      <PageHeader title="تفاصيل الصيانة" showBack />

      {successMsg && (
        <div className="mx-4 mt-3 px-4 py-3 rounded-xl bg-[hsl(var(--status-available-bg))] text-[hsl(var(--status-available))] text-sm font-semibold flex items-center gap-2 justify-end">
          <span>{successMsg}</span>
          <CheckCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">
        {/* Header card */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-[hsl(var(--status-maintenance-bg))] flex items-center justify-center flex-shrink-0">
            <Wrench className="w-7 h-7 text-[hsl(var(--status-maintenance))]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-base font-bold text-foreground truncate">
                {typeConfig.label}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold px-2.5 py-0.5 rounded-full",
                  statusBadgeClass[record.status],
                )}
              >
                {MAINTENANCE_STATUS_LABELS[record.status]}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {record.id.slice(0, 8)}
            </div>
          </div>
        </div>

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
                <span className="text-sm text-muted-foreground">—</span>
              )}
              {vehicle && (
                <div className="text-sm text-muted-foreground">{vehicle.plateNumber}</div>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm px-4 py-2">
          <InfoRow label="نوع الصيانة" value={typeConfig.label} />
          <InfoRow label="الحالة" value={MAINTENANCE_STATUS_LABELS[record.status] ?? record.status} />
          <InfoRow
            label="تاريخ الصيانة"
            value={
              <span className="flex items-center gap-1.5">
                {formatDateAr(record.maintenanceDate)}
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
              </span>
            }
          />
          {record.completedAt && (
            <InfoRow
              label="تاريخ الإنجاز"
              value={
                <span className="flex items-center gap-1.5 font-semibold text-[hsl(var(--status-available))]">
                  {formatDateAr(record.completedAt)}
                  <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                </span>
              }
            />
          )}
          {record.cost !== null && record.cost !== undefined && (
            <InfoRow
              label="التكلفة"
              value={
                <span className="flex items-center gap-1.5 font-bold text-foreground">
                  {formatCurrency(record.cost)}
                  <Banknote className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                </span>
              }
            />
          )}
          {record.vendor && (
            <InfoRow
              label="الورشة / المزوّد"
              value={
                <span className="flex items-center gap-1.5">
                  {record.vendor}
                  <Store className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                </span>
              }
            />
          )}
        </div>

        {/* Replaced parts */}
        {record.replacedParts && record.replacedParts.length > 0 && (
          <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
              <h3 className="text-sm font-bold text-foreground">القطع المبدلة</h3>
            </div>
            <div className="space-y-1.5">
              {record.replacedParts.map((part, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">
                    {part.name}
                    {part.brand ? ` (${part.brand})` : ""}
                    {part.quantity ? ` ×${part.quantity}` : ""}
                  </span>
                  {part.unitCost !== undefined && part.unitCost !== null && (
                    <span className="text-sm text-muted-foreground">{formatCurrency(part.unitCost)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {record.notes && (
          <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-2">
            <div className="flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
              <h3 className="text-sm font-bold text-foreground">ملاحظات</h3>
            </div>
            <p className="text-sm text-foreground text-right">{record.notes}</p>
          </div>
        )}

        {/* Complete action — only for non-completed records, OWNER only */}
        {isOwner && record.status !== "COMPLETED" && (
          <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-3">
            {completing ? (
              <>
                <div className="text-sm font-bold text-foreground text-right">إكمال الصيانة</div>
                <FormField label="التكلفة النهائية" required hint="غير سالبة · تُحسم نهائياً" error={actionError ?? undefined}>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="مثال: 150"
                    value={cost}
                    onChange={(e) => { setCost(e.target.value); setActionError(null); }}
                    className={actionError ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
                  />
                </FormField>
                {actionError && !cost && (
                  <p className="text-xs text-destructive text-right">{actionError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setCompleting(false)}
                    disabled={mutations.complete.isPending}
                    className="flex-1 border border-border text-foreground rounded-xl py-3 text-sm font-semibold active:scale-[0.98] transition-transform"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={mutations.complete.isPending}
                    className="flex-1 rounded-xl py-3 text-sm font-semibold bg-[hsl(var(--status-available))] text-white active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                  >
                    {mutations.complete.isPending ? <Spinner /> : "تأكيد الإنجاز"}
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => { setCompleting(true); setActionError(null); }}
                className="w-full flex items-center justify-center gap-2 bg-[hsl(var(--status-available))] text-white rounded-2xl py-4 text-base font-bold active:scale-[0.98] transition-transform shadow-sm"
              >
                <CheckCircle className="w-5 h-5" strokeWidth={2} />
                إكمال الصيانة
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
