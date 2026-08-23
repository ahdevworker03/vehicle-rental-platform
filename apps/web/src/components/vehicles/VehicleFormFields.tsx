import type {
  VehicleResponseFuelType,
  VehicleResponseStatus,
  VehicleResponseTransmission,
} from "@workspace/api-client-react";
import { FormField, inputClass } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormSection";
import {
  FUEL_TYPE_LABELS,
  TRANSMISSION_LABELS,
  VEHICLE_STATUS_LABELS,
} from "@/lib/vehicle-labels";

export interface VehicleFormState {
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

interface VehicleFormFieldsProps {
  form: VehicleFormState;
  errors: Partial<Record<keyof VehicleFormState, string>>;
  onChange: <K extends keyof VehicleFormState>(field: K, value: VehicleFormState[K]) => void;
}

function fieldClass(error?: string) {
  return error ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass;
}

/** Shared grouped fields for the add and edit vehicle workflows. */
export function VehicleFormFields({ form, errors, onChange }: VehicleFormFieldsProps) {
  return (
    <>
      <FormSection title="هوية المركبة" description="أدخل البيانات التي تميّز المركبة في الأسطول.">
        <FormField label="الشركة المصنعة" required error={errors.make} htmlFor="vehicle-make">
          <input id="vehicle-make" dir="ltr" className={fieldClass(errors.make)} placeholder="Toyota" value={form.make} onChange={(event) => onChange("make", event.target.value)} />
        </FormField>
        <FormField label="الطراز" required error={errors.model} htmlFor="vehicle-model">
          <input id="vehicle-model" dir="ltr" className={fieldClass(errors.model)} placeholder="Corolla" value={form.model} onChange={(event) => onChange("model", event.target.value)} />
        </FormField>
        <FormField label="رقم اللوحة" required error={errors.plate_number} htmlFor="vehicle-plate">
          <input id="vehicle-plate" dir="ltr" className={fieldClass(errors.plate_number)} placeholder="TEST-8237" value={form.plate_number} onChange={(event) => onChange("plate_number", event.target.value)} />
        </FormField>
        <FormField label="سنة الصنع" required error={errors.year} htmlFor="vehicle-year">
          <input id="vehicle-year" dir="ltr" inputMode="numeric" className={fieldClass(errors.year)} placeholder="2022" value={form.year} onChange={(event) => onChange("year", event.target.value)} />
        </FormField>
        <FormField label="اللون" required error={errors.color} htmlFor="vehicle-color" className="md:col-span-2">
          <input id="vehicle-color" className={fieldClass(errors.color)} placeholder="أبيض" value={form.color} onChange={(event) => onChange("color", event.target.value)} />
        </FormField>
      </FormSection>

      <FormSection title="المواصفات والتشغيل" description="حدّد مواصفات المركبة وحالتها الحالية.">
        <FormField label="ناقل الحركة" required htmlFor="vehicle-transmission">
          <select id="vehicle-transmission" className={inputClass} value={form.transmission} onChange={(event) => onChange("transmission", event.target.value as VehicleResponseTransmission)}>
            {(Object.keys(TRANSMISSION_LABELS) as VehicleResponseTransmission[]).map((transmission) => <option key={transmission} value={transmission}>{TRANSMISSION_LABELS[transmission]}</option>)}
          </select>
        </FormField>
        <FormField label="نوع الوقود" required htmlFor="vehicle-fuel-type">
          <select id="vehicle-fuel-type" className={inputClass} value={form.fuel_type} onChange={(event) => onChange("fuel_type", event.target.value as VehicleResponseFuelType)}>
            {(Object.keys(FUEL_TYPE_LABELS) as VehicleResponseFuelType[]).map((fuelType) => <option key={fuelType} value={fuelType}>{FUEL_TYPE_LABELS[fuelType]}</option>)}
          </select>
        </FormField>
        <FormField label="عدد المقاعد" required error={errors.seats} htmlFor="vehicle-seats">
          <input id="vehicle-seats" dir="ltr" inputMode="numeric" className={fieldClass(errors.seats)} placeholder="5" value={form.seats} onChange={(event) => onChange("seats", event.target.value)} />
        </FormField>
        <FormField label="العداد الحالي" required hint="بالكيلومتر" error={errors.current_mileage} htmlFor="vehicle-mileage">
          <input id="vehicle-mileage" dir="ltr" inputMode="numeric" className={fieldClass(errors.current_mileage)} placeholder="50000" value={form.current_mileage} onChange={(event) => onChange("current_mileage", event.target.value)} />
        </FormField>
        <FormField label="الحالة" required htmlFor="vehicle-status" className="md:col-span-2">
          <select id="vehicle-status" className={inputClass} value={form.status} onChange={(event) => onChange("status", event.target.value as VehicleResponseStatus)}>
            {(Object.keys(VEHICLE_STATUS_LABELS) as VehicleResponseStatus[]).map((status) => <option key={status} value={status}>{VEHICLE_STATUS_LABELS[status]}</option>)}
          </select>
        </FormField>
      </FormSection>

      <FormSection title="معرّفات إضافية" description="اختيارية، وتساعد في مطابقة المستندات وعمليات الصيانة.">
        <FormField label="رقم الشاصي (VIN)" htmlFor="vehicle-vin">
          <input id="vehicle-vin" dir="ltr" className={inputClass} placeholder="اختياري" value={form.vin} onChange={(event) => onChange("vin", event.target.value)} />
        </FormField>
        <FormField label="رقم المحرك" htmlFor="vehicle-engine-number">
          <input id="vehicle-engine-number" dir="ltr" className={inputClass} placeholder="اختياري" value={form.engine_number} onChange={(event) => onChange("engine_number", event.target.value)} />
        </FormField>
      </FormSection>
    </>
  );
}
