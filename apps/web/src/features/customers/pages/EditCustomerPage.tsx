import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Users } from "lucide-react";
import { useCustomerMutations, useCustomerRecord } from "@/features/customers/api-hooks";

import { CustomerFormFields, type CustomerFormState } from "@/features/customers/components/CustomerFormFields";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { InlineError, LoadingState } from "@/components/ui/FeedbackState";
import { getApiErrorMessage } from "@/lib/api-error";

interface DetailPageParams {
  params: { id: string };
}

function toDateInputValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function isValidDate(value: string): boolean {
  return Boolean(value) && !Number.isNaN(new Date(value).getTime());
}

export default function EditCustomerPage({ params }: DetailPageParams) {
  const { id } = params;
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<CustomerFormState | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormState, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const customerQuery = useCustomerRecord(id);
  const { update: updateMutation } = useCustomerMutations();

  useEffect(() => {
    if (!customerQuery.data?.data || form) return;
    const customer = customerQuery.data.data;
    setForm({
      first_name: customer.firstName, last_name: customer.lastName, phone: customer.phone, address: customer.address,
      national_id: customer.nationalId, license_number: customer.licenseNumber, license_expiry_date: toDateInputValue(customer.licenseExpiryDate),
    });
  }, [customerQuery.data, form]);

  function set<K extends keyof CustomerFormState>(field: K, value: CustomerFormState[K]) {
    setForm((current) => current ? { ...current, [field]: value } : current);
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): boolean {
    if (!form) return false;
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
    if (!form || updateMutation.isPending || !validate()) return;
    setFormError(null);
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          first_name: form.first_name.trim(), last_name: form.last_name.trim(), phone: form.phone.trim(), address: form.address.trim(),
          national_id: form.national_id.trim(), license_number: form.license_number.trim(), license_expiry_date: new Date(form.license_expiry_date).toISOString(),
        },
      });
      setLocation(`/customers/${id}`);
    } catch (error) {
      setFormError(getApiErrorMessage(error).title);
    }
  }

  if (customerQuery.isLoading || (!form && !customerQuery.isError)) return <div className="min-h-full"><PageHeader title="تعديل العميل" showBack /><div className="px-4 py-6 sm:px-6"><LoadingState rows={4} /></div></div>;
  if (customerQuery.isError || !form) return <div className="min-h-full"><PageHeader title="تعديل العميل" showBack /><EmptyState icon={Users} title="تعذر العثور على العميل" description={customerQuery.error ? getApiErrorMessage(customerQuery.error).title : "لم يتم العثور على هذا العميل."} className="py-16" /></div>;

  const canSave = Boolean(form.first_name.trim() && form.last_name.trim() && form.phone.trim() && form.address.trim() && form.national_id.trim() && form.license_number.trim() && form.license_expiry_date);

  return (
    <div className="min-h-full pb-6">
      <PageHeader title="تعديل العميل" showBack />
      <div className="mx-auto max-w-5xl space-y-4 px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        <div><h2 className="ui-page-title">بيانات العميل</h2><p className="ui-secondary-text mt-1">حدّث معلومات التواصل والهوية ورخصة القيادة.</p></div>
        {formError && <InlineError className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">{formError}</InlineError>}
        <CustomerFormFields form={form} errors={errors} onChange={set} />
        <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-border bg-background/95 py-3 backdrop-blur-sm">
          <Button type="button" variant="outline" onClick={() => setLocation(`/customers/${id}`)}>إلغاء</Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSave || updateMutation.isPending}>{updateMutation.isPending ? "جارٍ الحفظ" : "حفظ التعديلات"}</Button>
        </div>
      </div>
    </div>
  );
}
