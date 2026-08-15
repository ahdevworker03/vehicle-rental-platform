import { useState } from "react";
import { useLocation } from "wouter";
import { PageHeader } from "@/components/layout/PageHeader";
import { FormField, inputClass } from "@/components/ui/FormField";
import { Spinner } from "@/components/ui/spinner";
import { useCreateVehicle, getListVehiclesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { VEHICLE_STATUS_LABELS, TRANSMISSION_LABELS, FUEL_TYPE_LABELS } from "@/lib/vehicle-labels";
import type { VehicleResponseStatus, VehicleResponseTransmission, VehicleResponseFuelType } from "@workspace/api-client-react";

const CURRENT_YEAR = new Date().getFullYear();

interface FormState {
  make: string;
  model: string;
  plate_number: string;
  year: string;
  color: string;
  vin: string;
  engine_number: string;
  transmission: VehicleResponseTransmission;
  fuel_type: VehicleResponseFuelType;
  seats: string;
  current_mileage: string;
  status: VehicleResponseStatus;
}

const INITIAL: FormState = {
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
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateVehicle({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
        setLocation("/vehicles");
      },
    },
  });

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.make.trim()) e.make = "هذا الحقل مطلوب";
    if (!form.model.trim()) e.model = "هذا الحقل مطلوب";
    if (!form.plate_number.trim()) e.plate_number = "هذا الحقل مطلوب";
    if (!form.color.trim()) e.color = "هذا الحقل مطلوب";

    const year = Number(form.year);
    if (!form.year || isNaN(year) || year < 1900 || year > CURRENT_YEAR + 1) {
      e.year = "أدخل سنة صحيحة";
    }

    const seats = Number(form.seats);
    if (!form.seats || isNaN(seats) || !Number.isInteger(seats) || seats <= 0) {
      e.seats = "أدخل عدد مقاعد صحيحاً موجباً";
    }

    const mileage = Number(form.current_mileage);
    if (!form.current_mileage || isNaN(mileage) || !Number.isInteger(mileage) || mileage < 0) {
      e.current_mileage = "أدخل مسافة صحيحة غير سالبة";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (createMutation.isPending) return;
    if (!validate()) return;

    setFormError(null);

    try {
      await createMutation.mutateAsync({
        data: {
          make: form.make.trim(),
          model: form.model.trim(),
          plate_number: form.plate_number.trim(),
          year: Number(form.year),
          color: form.color.trim(),
          vin: form.vin.trim() || undefined,
          engine_number: form.engine_number.trim() || undefined,
          transmission: form.transmission,
          fuel_type: form.fuel_type,
          seats: Number(form.seats),
          current_mileage: Number(form.current_mileage),
          status: form.status,
        },
      });
    } catch (err) {
      setFormError(getApiErrorMessage(err).title);
    }
  }

  const isFormFilled =
    form.make.trim().length > 0 &&
    form.model.trim().length > 0 &&
    form.plate_number.trim().length > 0 &&
    form.color.trim().length > 0 &&
    form.year.trim().length > 0 &&
    form.seats.trim().length > 0 &&
    form.current_mileage.trim().length > 0;

  return (
    <div className="min-h-full pb-8">
      <PageHeader title="إضافة سيارة" showBack />

      <div className="px-4 pt-5 pb-8 mx-auto w-full max-w-3xl space-y-5">
        {formError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        {/* ── Basic Info ──────────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-4">
          <h3 className="text-sm font-bold text-foreground">معلومات السيارة</h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="الماركة" required error={errors.make}>
              <input
                className={errors.make ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
                placeholder="مثال: Toyota"
                value={form.make}
                onChange={(e) => set("make", e.target.value)}
              />
            </FormField>
            <FormField label="الموديل" required error={errors.model}>
              <input
                className={errors.model ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
                placeholder="مثال: Corolla"
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="السنة" required error={errors.year}>
              <input
                className={errors.year ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
                placeholder="مثال: 2022"
                inputMode="numeric"
                value={form.year}
                onChange={(e) => set("year", e.target.value)}
              />
            </FormField>
            <FormField label="رقم اللوحة" required error={errors.plate_number}>
              <input
                className={errors.plate_number ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
                placeholder="م أ 12345"
                value={form.plate_number}
                onChange={(e) => set("plate_number", e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="اللون" required error={errors.color}>
            <input
              className={errors.color ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
              placeholder="مثال: أبيض"
              value={form.color}
              onChange={(e) => set("color", e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="رقم الشاصي (VIN)">
              <input
                className={inputClass}
                placeholder="اختياري"
                value={form.vin}
                onChange={(e) => set("vin", e.target.value)}
                dir="ltr"
              />
            </FormField>
            <FormField label="رقم المحرك">
              <input
                className={inputClass}
                placeholder="اختياري"
                value={form.engine_number}
                onChange={(e) => set("engine_number", e.target.value)}
                dir="ltr"
              />
            </FormField>
          </div>
        </div>

        {/* ── Technical Info ──────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-4">
          <h3 className="text-sm font-bold text-foreground">المواصفات الفنية</h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="ناقل الحركة" required>
              <select
                className={inputClass}
                value={form.transmission}
                onChange={(e) => set("transmission", e.target.value as VehicleResponseTransmission)}
              >
                {(Object.keys(TRANSMISSION_LABELS) as VehicleResponseTransmission[]).map((t) => (
                  <option key={t} value={t}>{TRANSMISSION_LABELS[t]}</option>
                ))}
              </select>
            </FormField>
            <FormField label="نوع الوقود" required>
              <select
                className={inputClass}
                value={form.fuel_type}
                onChange={(e) => set("fuel_type", e.target.value as VehicleResponseFuelType)}
              >
                {(Object.keys(FUEL_TYPE_LABELS) as VehicleResponseFuelType[]).map((f) => (
                  <option key={f} value={f}>{FUEL_TYPE_LABELS[f]}</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="عدد المقاعد" required error={errors.seats}>
              <input
                className={errors.seats ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
                placeholder="مثال: 5"
                inputMode="numeric"
                value={form.seats}
                onChange={(e) => set("seats", e.target.value)}
              />
            </FormField>
            <FormField label="المسافة المقطوعة" required hint="بالكيلومتر" error={errors.current_mileage}>
              <input
                className={errors.current_mileage ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
                placeholder="مثال: 50000"
                inputMode="numeric"
                value={form.current_mileage}
                onChange={(e) => set("current_mileage", e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="الحالة" required>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => set("status", e.target.value as VehicleResponseStatus)}
            >
              {(Object.keys(VEHICLE_STATUS_LABELS) as VehicleResponseStatus[]).map((s) => (
                <option key={s} value={s}>{VEHICLE_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </FormField>
        </div>

        {/* ── Save Button ─────────────────────────────────────────────── */}
        <button
          onClick={handleSubmit}
          disabled={!isFormFilled || createMutation.isPending}
          className={cn(
            "w-full rounded-2xl py-4 text-base font-bold transition-all shadow-sm flex items-center justify-center gap-2",
            isFormFilled && !createMutation.isPending
              ? "bg-primary text-primary-foreground active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          {createMutation.isPending ? <Spinner /> : "حفظ السيارة"}
        </button>
      </div>
    </div>
  );
}
