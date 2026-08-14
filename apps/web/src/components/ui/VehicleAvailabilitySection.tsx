import { useState } from "react";
import { CalendarSearch, Car, AlertCircle } from "lucide-react";

import { FormField, inputClass } from "@/components/ui/FormField";
import { VehicleStatusBadge } from "@/components/ui/VehicleStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAvailableVehicles } from "@/features/rentals/api-hooks";
import type { VehicleResponse } from "@workspace/api-client-react";

function toISO(datetimeLocal: string): string {
  return new Date(datetimeLocal).toISOString();
}

export function VehicleAvailabilitySection() {
  const [pickup, setPickup] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{ pickup: string; returnDate: string } | null>(null);

  const params = submitted
    ? {
        pickupDate: toISO(submitted.pickup),
        expectedReturnDate: toISO(submitted.returnDate),
      }
    : null;

  const { query } = useAvailableVehicles(params);

  function handleSubmit() {
    setValidationError(null);
    if (!pickup || !returnDate) {
      setValidationError("أدخل تاريخَي الاستلام والإرجاع");
      return;
    }
    const pickupDate = new Date(pickup);
    const returnD = new Date(returnDate);
    if (returnD.getTime() <= pickupDate.getTime()) {
      setValidationError("تاريخ الإرجاع يجب أن يكون بعد تاريخ الاستلام");
      return;
    }
    setSubmitted({ pickup, returnDate });
  }

  const vehicles: VehicleResponse[] = query.data?.data ?? [];

  return (
    <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-4">
      <div className="flex items-center gap-2">
        <CalendarSearch className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
        <h3 className="text-sm font-bold text-foreground">السيارات المتاحة</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="تاريخ الاستلام" required>
          <input
            type="datetime-local"
            value={pickup}
            onChange={(e) => {
              setPickup(e.target.value);
              setValidationError(null);
            }}
            className={inputClass}
          />
        </FormField>
        <FormField label="تاريخ الإرجاع" required>
          <input
            type="datetime-local"
            value={returnDate}
            min={pickup}
            onChange={(e) => {
              setReturnDate(e.target.value);
              setValidationError(null);
            }}
            className={inputClass}
          />
        </FormField>
      </div>

      {validationError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-2.5 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
          <span>{validationError}</span>
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold active:scale-[0.98] transition-transform"
      >
        <CalendarSearch className="size-4" strokeWidth={2} />
        البحث عن السيارات المتاحة
      </button>

      {submitted && (
        <div className="border-t border-border pt-3">
          {query.isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Spinner />
            </div>
          ) : query.isError ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              {query.error ? getApiErrorMessage(query.error).title : "حدث خطأ في التحقق من التوفر"}
            </div>
          ) : vehicles.length === 0 ? (
            <EmptyState
              icon={Car}
              title="لا توجد سيارات متاحة"
              description="لا توجد سيارات متاحة في هذه الفترة"
              className="py-6"
            />
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-right">
                {vehicles.length} سيارة متاحة
              </p>
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="bg-muted rounded-xl p-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                    <Car className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">
                      {v.make} {v.model}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{v.plateNumber}</div>
                  </div>
                  <VehicleStatusBadge status={v.status as never} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
