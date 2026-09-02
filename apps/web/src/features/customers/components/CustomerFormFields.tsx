import { FormField, inputClass } from "@/components/ui/FormField";
import { DatePicker } from "@/components/ui/date-picker";
import { FormSection } from "@/components/ui/FormSection";

export interface CustomerFormState {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  national_id: string;
  license_number: string;
  license_expiry_date: string;
}

interface CustomerFormFieldsProps {
  form: CustomerFormState;
  errors: Partial<Record<keyof CustomerFormState, string>>;
  onChange: <K extends keyof CustomerFormState>(field: K, value: CustomerFormState[K]) => void;
}

function fieldClass(error?: string) {
  return error ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass;
}

/** Shared grouped fields for the add and edit customer workflows. */
export function CustomerFormFields({ form, errors, onChange }: CustomerFormFieldsProps) {
  return (
    <>
      <FormSection title="معلومات العميل" description="أدخل بيانات العميل الأساسية للتواصل وإدارة الإيجارات.">
        <FormField label="الاسم الأول" required error={errors.first_name} htmlFor="customer-first-name"><input id="customer-first-name" className={fieldClass(errors.first_name)} placeholder="مثال: أحمد" value={form.first_name} onChange={(event) => onChange("first_name", event.target.value)} autoComplete="given-name" /></FormField>
        <FormField label="اسم العائلة" required error={errors.last_name} htmlFor="customer-last-name"><input id="customer-last-name" className={fieldClass(errors.last_name)} placeholder="مثال: محمد" value={form.last_name} onChange={(event) => onChange("last_name", event.target.value)} autoComplete="family-name" /></FormField>
      </FormSection>

      <FormSection title="معلومات التواصل" description="استخدم بيانات يمكن الرجوع إليها أثناء الإيجار.">
        <FormField label="رقم الهاتف" required error={errors.phone} htmlFor="customer-phone"><input id="customer-phone" dir="ltr" inputMode="tel" className={fieldClass(errors.phone)} placeholder="03-123456" value={form.phone} onChange={(event) => onChange("phone", event.target.value)} autoComplete="tel" /></FormField>
        <FormField label="العنوان" required error={errors.address} htmlFor="customer-address"><input id="customer-address" className={fieldClass(errors.address)} placeholder="مثال: بيروت" value={form.address} onChange={(event) => onChange("address", event.target.value)} autoComplete="street-address" /></FormField>
      </FormSection>

      <FormSection title="الهوية والرخصة" description="تحقّق من بيانات الهوية ورخصة القيادة قبل إنشاء الإيجار.">
        <FormField label="رقم الهوية" required error={errors.national_id} htmlFor="customer-national-id"><input id="customer-national-id" dir="ltr" className={fieldClass(errors.national_id)} placeholder="رقم الهوية الوطنية" value={form.national_id} onChange={(event) => onChange("national_id", event.target.value)} autoComplete="off" /></FormField>
        <FormField label="رقم الرخصة" required error={errors.license_number} htmlFor="customer-license-number"><input id="customer-license-number" dir="ltr" className={fieldClass(errors.license_number)} placeholder="رقم الرخصة" value={form.license_number} onChange={(event) => onChange("license_number", event.target.value)} autoComplete="off" /></FormField>
        <FormField label="تاريخ انتهاء الرخصة" required error={errors.license_expiry_date} htmlFor="customer-license-expiry" className="md:col-span-2"><DatePicker id="customer-license-expiry" value={form.license_expiry_date} onChange={(value) => onChange("license_expiry_date", value)} aria-invalid={Boolean(errors.license_expiry_date)} className={fieldClass(errors.license_expiry_date)} /></FormField>
      </FormSection>
    </>
  );
}
