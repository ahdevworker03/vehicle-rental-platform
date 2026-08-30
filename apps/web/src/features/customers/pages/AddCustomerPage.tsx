import { useRef, useState } from "react";
import { useLocation } from "wouter";
import { FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { useUploadCustomerDocument, type DocumentResponseCategory } from "@workspace/api-client-react";
import { useCustomerMutations } from "@/features/customers/api-hooks";

import { CustomerFormFields, type CustomerFormState } from "@/features/customers/components/CustomerFormFields";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { InlineError } from "@/components/ui/FeedbackState";
import { SectionCard } from "@/components/ui/SectionCard";
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

interface PendingDocument {
  id: string;
  file: File;
  category: DocumentResponseCategory;
}

function isValidDate(value: string): boolean {
  return Boolean(value) && !Number.isNaN(new Date(value).getTime());
}

export default function AddCustomerPage() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<CustomerFormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormState, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<PendingDocument[]>([]);
  const [createdCustomerId, setCreatedCustomerId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { create: createMutation } = useCustomerMutations();
  const uploadMutation = useUploadCustomerDocument();

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
    if (createMutation.isPending || uploadMutation.isPending || (!createdCustomerId && !validate())) return;
    setFormError(null);
    let customerId = createdCustomerId;
    try {
      customerId = customerId ?? (await createMutation.mutateAsync({
        data: {
          first_name: form.first_name.trim(), last_name: form.last_name.trim(), phone: form.phone.trim(), address: form.address.trim(),
          national_id: form.national_id.trim(), license_number: form.license_number.trim(), license_expiry_date: new Date(form.license_expiry_date).toISOString(),
        },
      })).data.id;
      setCreatedCustomerId(customerId);

      for (const document of documents) {
        await uploadMutation.mutateAsync({ customerId, data: { file: document.file, category: document.category } });
        setDocuments((current) => current.filter((item) => item.id !== document.id));
      }

      setLocation(`/customers/${customerId}`);
    } catch (error) {
      setFormError(customerId ? "تم إنشاء العميل، لكن تعذر رفع بعض المستندات. أعد المحاولة أو أضفها من صفحة العميل." : getApiErrorMessage(error).title);
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
        <SectionCard title="مستندات العميل" description="اختيارية. تُرفع المستندات بعد حفظ بيانات العميل بنجاح.">
          <input ref={fileInputRef} type="file" accept="application/pdf,image/jpeg,image/png" multiple className="hidden" onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            setDocuments((current) => [...current, ...files.map((file) => ({ id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`, file, category: "OTHER" as const }))]);
            event.target.value = "";
          }} />
          <div className="space-y-3">
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={createMutation.isPending || uploadMutation.isPending}><Plus className="size-4" aria-hidden="true" />إضافة مستند</Button>
            {documents.length > 0 ? <div className="divide-y divide-border rounded-lg border border-border">{documents.map((document) => <div key={document.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5"><FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground" dir="auto">{document.file.name}</span><select aria-label={`نوع المستند ${document.file.name}`} value={document.category} onChange={(event) => setDocuments((current) => current.map((item) => item.id === document.id ? { ...item, category: event.target.value as DocumentResponseCategory } : item))} className="h-9 rounded-lg border border-input bg-background px-2 text-sm"><option value="REGISTRATION">تسجيل</option><option value="INSURANCE">تأمين</option><option value="OTHER">أخرى</option></select><Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/5" onClick={() => setDocuments((current) => current.filter((item) => item.id !== document.id))} aria-label={`إزالة المستند ${document.file.name}`}><Trash2 className="size-4" aria-hidden="true" /></Button></div>)}</div> : <p className="ui-secondary-text">يمكن إضافة ملفات PDF أو صور JPG وPNG الآن أو لاحقاً من صفحة العميل.</p>}
          </div>
        </SectionCard>
        <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-border bg-background/95 py-3 backdrop-blur-sm">
          <Button type="button" variant="outline" onClick={() => setLocation("/customers")}>إلغاء</Button>
          <Button type="button" onClick={handleSubmit} disabled={(!createdCustomerId && !canSave) || createMutation.isPending || uploadMutation.isPending}>{createMutation.isPending || uploadMutation.isPending ? <><Loader2 className="size-4 animate-spin" aria-hidden="true" />جارٍ الحفظ</> : createdCustomerId ? "إعادة رفع المستندات" : "حفظ العميل"}</Button>
        </div>
      </div>
    </div>
  );
}
