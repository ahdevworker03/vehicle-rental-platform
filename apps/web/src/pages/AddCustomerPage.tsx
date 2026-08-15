import { useState } from "react";
import { useLocation } from "wouter";
import { PageHeader } from "@/components/layout/PageHeader";
import { FormField, inputClass } from "@/components/ui/FormField";
import { Spinner } from "@/components/ui/spinner";
import { useCreateCustomer, getListCustomersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";

interface FormState {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  national_id: string;
  license_number: string;
  license_expiry_date: string;
}

const INITIAL: FormState = {
  first_name: "",
  last_name: "",
  phone: "",
  address: "",
  national_id: "",
  license_number: "",
  license_expiry_date: "",
};

function isValidDate(value: string): boolean {
  if (!value) return false;
  return !isNaN(new Date(value).getTime());
}

export default function AddCustomerPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateCustomer({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
        setLocation("/customers");
      },
    },
  });

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.first_name.trim()) e.first_name = "هذا الحقل مطلوب";
    if (!form.last_name.trim()) e.last_name = "هذا الحقل مطلوب";
    if (!form.phone.trim()) e.phone = "هذا الحقل مطلوب";
    if (!form.address.trim()) e.address = "هذا الحقل مطلوب";
    if (!form.national_id.trim()) e.national_id = "هذا الحقل مطلوب";
    if (!form.license_number.trim()) e.license_number = "هذا الحقل مطلوب";
    if (!isValidDate(form.license_expiry_date)) e.license_expiry_date = "أدخل تاريخاً صحيحاً";
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
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          national_id: form.national_id.trim(),
          license_number: form.license_number.trim(),
          license_expiry_date: new Date(form.license_expiry_date).toISOString(),
        },
      });
    } catch (err) {
      setFormError(getApiErrorMessage(err).title);
    }
  }

  const isFormFilled =
    form.first_name.trim().length > 0 &&
    form.last_name.trim().length > 0 &&
    form.phone.trim().length > 0 &&
    form.address.trim().length > 0 &&
    form.national_id.trim().length > 0 &&
    form.license_number.trim().length > 0 &&
    form.license_expiry_date.length > 0;

  return (
    <div className="min-h-full pb-8">
      <PageHeader title="إضافة عميل" showBack />

      <div className="px-4 pt-5 pb-8 mx-auto w-full max-w-3xl space-y-5">
        {formError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        {/* ── Customer Info ─────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-4">
          <h3 className="text-sm font-bold text-foreground">معلومات العميل</h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="الاسم الأول" required error={errors.first_name}>
              <input
                className={errors.first_name ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
                placeholder="مثال: أحمد"
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
                autoComplete="given-name"
              />
            </FormField>
            <FormField label="اسم العائلة" required error={errors.last_name}>
              <input
                className={errors.last_name ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
                placeholder="مثال: محمد"
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
                autoComplete="family-name"
              />
            </FormField>
          </div>

          <FormField label="رقم الهاتف" required error={errors.phone}>
            <input
              className={errors.phone ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
              placeholder="مثال: 03-123456"
              inputMode="tel"
              dir="ltr"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              autoComplete="tel"
            />
          </FormField>

          <FormField label="العنوان" required error={errors.address}>
            <input
              className={errors.address ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
              placeholder="مثال: بيروت"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </FormField>
        </div>

        {/* ── Identity & License ────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-4">
          <h3 className="text-sm font-bold text-foreground">الهوية والرخصة</h3>

          <FormField label="رقم الهوية" required error={errors.national_id}>
            <input
              className={errors.national_id ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
              placeholder="رقم الهوية الوطنية"
              dir="ltr"
              value={form.national_id}
              onChange={(e) => set("national_id", e.target.value)}
              autoComplete="off"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="رقم الرخصة" required error={errors.license_number}>
              <input
                className={errors.license_number ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
                placeholder="رقم الرخصة"
                dir="ltr"
                value={form.license_number}
                onChange={(e) => set("license_number", e.target.value)}
                autoComplete="off"
              />
            </FormField>
            <FormField label="تاريخ انتهاء الرخصة" required error={errors.license_expiry_date}>
              <input
                type="date"
                className={errors.license_expiry_date ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
                value={form.license_expiry_date}
                onChange={(e) => set("license_expiry_date", e.target.value)}
              />
            </FormField>
          </div>
        </div>

        {/* ── Save Button ───────────────────────────────────────────── */}
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
          {createMutation.isPending ? <Spinner /> : "حفظ العميل"}
        </button>
      </div>
    </div>
  );
}
