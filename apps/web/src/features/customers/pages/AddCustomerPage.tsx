import { useState } from "react";
import { useLocation } from "wouter";
import { useCustomerMutations } from "@/features/customers/api-hooks";

import { CustomerFormFields, type CustomerFormState } from "@/features/customers/components/CustomerFormFields";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { InlineError } from "@/components/ui/FeedbackState";
import { getApiErrorMessage } from "@/lib/api-error";

const INITIAL: CustomerFormState = {
  first_name: "",
  last_name: "",
  phone: "",
  address: "",
  national_id: "",
  license_number: "",
  license_expiry_date: "",
};

function isValidDate(value: string): boolean {
  return Boolean(value) && !Number.isNaN(new Date(value).getTime());
}

export default function AddCustomerPage() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<CustomerFormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormState, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const { create: createMutation } = useCustomerMutations();

  function set<K extends keyof CustomerFormState>(field: K, value: CustomerFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof CustomerFormState, string>> = {};
    if (!form.first_name.trim()) nextErrors.first_name = "هذا الحقل مطلوب.";
    if (!form.last_name.trim()) nextErrors.last_name = "هذا الحقل مطلوب.";
    if (!form.phone.trim()) nextErrors.phone = "هذا الحقل مطلوب.";
    if (!form.address.trim()) nextErrors.address = "هذا الحقل مطلوب.";
    if (!form.national_id.trim()) nextErrors.national_id = "هذا الحقل مطلوب.";
    if (!form.license_number.trim()) nextErrors.license_number = "هذا الحقل مطلوب.";
    if (!isValidDate(form.license_expiry_date)) nextErrors.license_expiry_date = "أدخل تاريخاً صحيحاً.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (createMutation.isPending || !validate()) return;
    setFormError(null);
    try {
      await createMutation.mutateAsync({
        data: {
          first_name: form.first_name.trim(), last_name: form.last_name.trim(), phone: form.phone.trim(), address: form.address.trim(),
          national_id: form.national_id.trim(), license_number: form.license_number.trim(), license_expiry_date: new Date(form.license_expiry_date).toISOString(),
        },
      });
      setLocation("/customers");
    } catch (error) {
      setFormError(getApiErrorMessage(error).title);
    }
  }

  const canSave = Boolean(form.first_name.trim() && form.last_name.trim() && form.phone.trim() && form.address.trim() && form.national_id.trim() && form.license_number.trim() && form.license_expiry_date);

  return (
    <div className="min-h-full pb-6">
      <PageHeader title="إضافة عميل" showBack />
      <div className="mx-auto max-w-5xl space-y-4 px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        <div><h2 className="ui-page-title">بيانات العميل</h2><p className="ui-secondary-text mt-1">أدخل معلومات العميل وبيانات هويته ورخصة القيادة.</p></div>
        {formError && <InlineError className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">{formError}</InlineError>}
        <CustomerFormFields form={form} errors={errors} onChange={set} />
        <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-border bg-background/95 py-3 backdrop-blur-sm">
          <Button type="button" variant="outline" onClick={() => setLocation("/customers")}>إلغاء</Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSave || createMutation.isPending}>{createMutation.isPending ? "جارٍ الحفظ" : "حفظ العميل"}</Button>
        </div>
      </div>
    </div>
  );
}
