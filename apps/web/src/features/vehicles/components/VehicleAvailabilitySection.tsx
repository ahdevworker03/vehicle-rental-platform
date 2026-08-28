import { useState } from "react";
import { CalendarSearch, Car } from "lucide-react";
import type { VehicleResponse } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState, InlineError, LoadingState } from "@/components/ui/FeedbackState";
import { FormField, inputClass } from "@/components/ui/FormField";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAvailableVehicles } from "@/features/rentals/api-hooks";
import { getApiErrorMessage } from "@/lib/api-error";

function toISO(datetimeLocal: string): string {
  return new Date(datetimeLocal).toISOString();
}

export function VehicleAvailabilitySection() {
  const [pickup, setPickup] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{ pickup: string; returnDate: string } | null>(null);
  const params = submitted ? { pickupDate: toISO(submitted.pickup), expectedReturnDate: toISO(submitted.returnDate) } : null;
  const { query } = useAvailableVehicles(params);
  const vehicles: VehicleResponse[] = query.data?.data ?? [];

  function handleSubmit() {
    setValidationError(null);
    if (!pickup || !returnDate) return setValidationError("أدخل تاريخَي الاستلام والإرجاع.");
    if (new Date(returnDate).getTime() <= new Date(pickup).getTime()) return setValidationError("تاريخ الإرجاع يجب أن يكون بعد تاريخ الاستلام.");
    setSubmitted({ pickup, returnDate });
  }

  return (
    <SectionCard title="فحص التوفر" description="تحقق من المركبات المتاحة ضمن فترة إيجار محددة." className="shadow-none">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="تاريخ الاستلام" required htmlFor="availability-pickup">
            <input id="availability-pickup" type="datetime-local" value={pickup} onChange={(event) => { setPickup(event.target.value); setValidationError(null); }} className={inputClass} />
          </FormField>
          <FormField label="تاريخ الإرجاع" required htmlFor="availability-return">
            <input id="availability-return" type="datetime-local" min={pickup} value={returnDate} onChange={(event) => { setReturnDate(event.target.value); setValidationError(null); }} className={inputClass} />
          </FormField>
        </div>
        {validationError && <InlineError>{validationError}</InlineError>}
        <Button type="button" onClick={handleSubmit}><CalendarSearch className="size-4" aria-hidden="true" />التحقق من التوفر</Button>

        {submitted && (
          <div className="border-t border-border pt-4">
            {query.isLoading ? <LoadingState rows={2} /> : query.isError ? <ErrorState title="تعذر التحقق من التوفر" description={query.error ? getApiErrorMessage(query.error).title : "تعذر التحقق من التوفر. حاول مرة أخرى."} onRetry={() => void query.refetch()} /> : vehicles.length === 0 ? (
              <EmptyState icon={Car} title="لا توجد مركبات متاحة" description="جرّب فترة إيجار مختلفة أو راجع المركبات الحالية." className="py-6" />
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{vehicles.length} مركبات متاحة للفترة المحددة.</p>
                <div className="divide-y divide-border rounded-lg border border-border">
                  {vehicles.map((vehicle) => <div key={vehicle.id} className="flex items-center justify-between gap-3 px-3 py-3"><div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Car className="size-4" aria-hidden="true" /></span><span className="min-w-0"><span dir="ltr" className="block truncate text-sm font-semibold text-foreground">{vehicle.make} {vehicle.model}</span><span dir="ltr" className="number-ltr mt-0.5 block text-xs text-muted-foreground">{vehicle.plateNumber}</span></span></div><StatusBadge status={vehicle.status} /></div>)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
