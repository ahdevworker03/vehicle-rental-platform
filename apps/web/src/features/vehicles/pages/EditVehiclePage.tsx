import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Car } from "lucide-react";
import { useVehicleMutations, useVehicleRecord } from "@/features/vehicles/api-hooks";
import { VehicleFormFields, type VehicleFormState } from "@/features/vehicles/components/VehicleFormFields";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { InlineError, LoadingState } from "@/components/ui/FeedbackState";
import { getApiErrorMessage } from "@/lib/api-error";

const CURRENT_YEAR = new Date().getFullYear();

interface DetailPageParams {
  params: { id: string };
}

export default function EditVehiclePage({ params }: DetailPageParams) {
  const { id } = params;
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<VehicleFormState | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof VehicleFormState, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const vehicleQuery = useVehicleRecord(id);
  const { update: updateMutation } = useVehicleMutations();

  useEffect(() => {
    if (!vehicleQuery.data?.data || form) return;
    const vehicle = vehicleQuery.data.data;
    setForm({
      make: vehicle.make, model: vehicle.model, plate_number: vehicle.plateNumber, year: String(vehicle.year), color: vehicle.color,
      vin: vehicle.vin ?? "", engine_number: vehicle.engineNumber ?? "", transmission: vehicle.transmission, fuel_type: vehicle.fuelType,
      seats: String(vehicle.seats), current_mileage: String(vehicle.currentMileage), status: vehicle.status,
    });
  }, [form, vehicleQuery.data]);

  function set<K extends keyof VehicleFormState>(field: K, value: VehicleFormState[K]) {
    setForm((current) => current ? { ...current, [field]: value } : current);
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): boolean {
    if (!form) return false;
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
    if (!form || updateMutation.isPending || !validate()) return;
    setFormError(null);
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          make: form.make.trim(), model: form.model.trim(), plate_number: form.plate_number.trim(), year: Number(form.year), color: form.color.trim(),
          vin: form.vin.trim() || undefined, engine_number: form.engine_number.trim() || undefined, transmission: form.transmission,
          fuel_type: form.fuel_type, seats: Number(form.seats), current_mileage: Number(form.current_mileage), status: form.status,
        },
      });
      setLocation(`/vehicles/${id}`);
    } catch (error) {
      setFormError(getApiErrorMessage(error).title);
    }
  }

  if (vehicleQuery.isLoading || !form && !vehicleQuery.isError) return <div className="min-h-full"><PageHeader title="تعديل المركبة" showBack /><div className="px-4 py-6 sm:px-6"><LoadingState rows={4} /></div></div>;
  if (vehicleQuery.isError || !form) return <div className="min-h-full"><PageHeader title="تعديل المركبة" showBack /><EmptyState icon={Car} title="تعذر العثور على المركبة" description={vehicleQuery.error ? getApiErrorMessage(vehicleQuery.error).title : "لم يتم العثور على هذه المركبة."} className="py-16" /></div>;

  const canSave = Boolean(form.make.trim() && form.model.trim() && form.plate_number.trim() && form.color.trim() && form.year.trim() && form.seats.trim() && form.current_mileage.trim());

  return (
    <div className="min-h-full pb-6">
      <PageHeader title="تعديل المركبة" showBack />
      <div className="mx-auto max-w-5xl space-y-4 px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        <div><h2 className="ui-page-title">بيانات المركبة</h2><p className="ui-secondary-text mt-1">حدّث بيانات الهوية والمواصفات والحالة التشغيلية.</p></div>
        {formError && <InlineError className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">{formError}</InlineError>}
        <VehicleFormFields form={form} errors={errors} onChange={set} />
        <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-border bg-background/95 py-3 backdrop-blur-sm">
          <Button type="button" variant="outline" onClick={() => setLocation(`/vehicles/${id}`)}>إلغاء</Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSave || updateMutation.isPending}>{updateMutation.isPending ? "جارٍ الحفظ" : "حفظ التعديلات"}</Button>
        </div>
      </div>
    </div>
  );
}
