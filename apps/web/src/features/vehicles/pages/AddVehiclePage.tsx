import { useState } from "react";
import { useLocation } from "wouter";
import type { VehicleResponseStatus } from "@workspace/api-client-react";
import { useVehicleMutations } from "@/features/vehicles/api-hooks";
import { VehicleFormFields, type VehicleFormState } from "@/features/vehicles/components/VehicleFormFields";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { InlineError } from "@/components/ui/FeedbackState";
import { getApiErrorMessage } from "@/lib/api-error";

const CURRENT_YEAR = new Date().getFullYear();

const INITIAL: VehicleFormState = {
  make: "",
  model: "",
  plate_number: "",
  year: "",
  color: "",
  vin: "",
  engine_number: "",
  transmission: "AUTOMATIC",
  fuel_type: "PETROL",
  seats: "",
  current_mileage: "",
  status: "AVAILABLE",
};

export default function AddVehiclePage() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<VehicleFormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof VehicleFormState, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const { create: createMutation } = useVehicleMutations();

  function set<K extends keyof VehicleFormState>(field: K, value: VehicleFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof VehicleFormState, string>> = {};
    if (!form.make.trim()) nextErrors.make = "هذا الحقل مطلوب.";
    if (!form.model.trim()) nextErrors.model = "هذا الحقل مطلوب.";
    if (!form.plate_number.trim()) nextErrors.plate_number = "هذا الحقل مطلوب.";
    if (!form.color.trim()) nextErrors.color = "هذا الحقل مطلوب.";
    const year = Number(form.year);
    if (!form.year || Number.isNaN(year) || year < 1900 || year > CURRENT_YEAR + 1) nextErrors.year = "أدخل سنة صحيحة.";
    const seats = Number(form.seats);
    if (!form.seats || Number.isNaN(seats) || !Number.isInteger(seats) || seats <= 0) nextErrors.seats = "أدخل عدد مقاعد صحيحاً موجباً.";
    const mileage = Number(form.current_mileage);
    if (!form.current_mileage || Number.isNaN(mileage) || !Number.isInteger(mileage) || mileage < 0) nextErrors.current_mileage = "أدخل مسافة صحيحة غير سالبة.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (createMutation.isPending || !validate()) return;
    setFormError(null);
    try {
      await createMutation.mutateAsync({
        data: {
          make: form.make.trim(), model: form.model.trim(), plate_number: form.plate_number.trim(), year: Number(form.year), color: form.color.trim(),
          vin: form.vin.trim() || undefined, engine_number: form.engine_number.trim() || undefined, transmission: form.transmission,
          fuel_type: form.fuel_type, seats: Number(form.seats), current_mileage: Number(form.current_mileage), status: form.status as VehicleResponseStatus,
        },
      });
      setLocation("/vehicles");
    } catch (error) {
      setFormError(getApiErrorMessage(error).title);
    }
  }

  const canSave = Boolean(form.make.trim() && form.model.trim() && form.plate_number.trim() && form.color.trim() && form.year.trim() && form.seats.trim() && form.current_mileage.trim());

  return (
    <div className="min-h-full pb-6">
      <PageHeader title="إضافة مركبة" showBack />
      <div className="mx-auto max-w-5xl space-y-4 px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        <div><h2 className="ui-page-title">بيانات المركبة</h2><p className="ui-secondary-text mt-1">أدخل هوية المركبة ومواصفاتها قبل إضافتها إلى الأسطول.</p></div>
        {formError && <InlineError className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">{formError}</InlineError>}
        <VehicleFormFields form={form} errors={errors} onChange={set} />
        <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-border bg-background/95 py-3 backdrop-blur-sm">
          <Button type="button" variant="outline" onClick={() => setLocation("/vehicles")}>إلغاء</Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSave || createMutation.isPending}>{createMutation.isPending ? "جارٍ الحفظ" : "حفظ المركبة"}</Button>
        </div>
      </div>
    </div>
  );
}
