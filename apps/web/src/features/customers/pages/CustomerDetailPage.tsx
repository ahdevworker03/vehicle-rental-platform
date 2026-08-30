import { useState } from "react";
import { useLocation } from "wouter";
import { IdCard, Pencil, Phone, Trash2, UserRound } from "lucide-react";
import { useCustomerMutations, useCustomerRecord } from "@/features/customers/api-hooks";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DocumentList } from "@/features/media";
import { ErrorState, InlineError, LoadingState } from "@/components/ui/FeedbackState";
import { RentalHistorySection } from "@/features/rentals";
import { DetailSection } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCustomerDocuments } from "@/features/media/hooks";
import { useRentalsForCustomer } from "@/features/rentals/api-hooks";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/providers/AuthProvider";

interface DetailPageParams {
  params: { id: string };
}

function KeyValue({ label, value, numeric = false }: { label: string; value?: string; numeric?: boolean }) {
  return (
    <div className="min-w-0 text-right">
      <div className="ui-label">{label}</div>
      <div dir={numeric ? "ltr" : undefined} className={`mt-1.5 break-words text-sm font-semibold text-foreground ${numeric ? "number-ltr" : ""}`}>{value || "—"}</div>
    </div>
  );
}

export default function CustomerDetailPage({ params }: DetailPageParams) {
  const { id } = params;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const customerQuery = useCustomerRecord(id);
  const documents = useCustomerDocuments(id);
  const customerRentals = useRentalsForCustomer(id);
  const { remove: deleteMutation } = useCustomerMutations();

  async function handleUploadDocument(file: File, category: string) {
    await documents.upload.mutateAsync({ customerId: id, data: { file, category: category as "REGISTRATION" | "INSURANCE" | "OTHER" } });
  }

  async function handleDeleteDocument(documentId: string) {
    await documents.remove.mutateAsync({ customerId: id, id: documentId });
  }

  async function handleUpdateDocumentExpiry(documentId: string, expiryDate: string | null) {
    await documents.update.mutateAsync({ customerId: id, id: documentId, data: { expiryDate } });
  }

  async function handleDownloadDocument(fileDocument: { id: string; originalFilename: string }) {
    const blob = await documents.download(fileDocument.id);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileDocument.originalFilename || "document";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function handleDelete() {
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync({ id });
      setLocation("/customers");
    } catch (error) {
      setDeleteError(getApiErrorMessage(error).title);
    }
  }

  if (customerQuery.isLoading) return <div className="min-h-full"><PageHeader title="تفاصيل العميل" showBack /><div className="px-4 py-6 sm:px-6"><LoadingState rows={5} /></div></div>;
  const customer = customerQuery.data?.data;
  if (customerQuery.isError || !customer) return <div className="min-h-full"><PageHeader title="تفاصيل العميل" showBack /><ErrorState className="py-16" title="تعذر تحميل العميل" description={customerQuery.error ? getApiErrorMessage(customerQuery.error).title : "لم يتم العثور على هذا العميل."} onRetry={() => void customerQuery.refetch()} /></div>;

  const fullName = `${customer.firstName} ${customer.lastName}`.trim();
  const currentRental = customerRentals.rentals.find((rental) => rental.status === "ACTIVE" || rental.status === "RESERVED");
  const licenseExpiresAt = new Date(customer.licenseExpiryDate);
  const licenseExpired = !Number.isNaN(licenseExpiresAt.getTime()) && licenseExpiresAt < new Date();

  return (
    <div className="min-h-full pb-8">
      <PageHeader title="تفاصيل العميل" showBack action={isOwner ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {confirmingDelete ? <>
            <Button type="button" variant="outline" size="sm" onClick={() => { setConfirmingDelete(false); setDeleteError(null); }} disabled={deleteMutation.isPending}>إلغاء</Button>
            <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? "جارٍ الحذف" : "تأكيد الحذف"}</Button>
          </> : <>
            <Button type="button" size="sm" onClick={() => setLocation(`/customers/${customer.id}/edit`)}><Pencil className="size-4" aria-hidden="true" />تعديل</Button>
            <Button type="button" variant="destructive" size="sm" onClick={() => setConfirmingDelete(true)}><Trash2 className="size-4" aria-hidden="true" />حذف</Button>
          </>}
        </div>
      ) : undefined} />

      <div className="space-y-4 px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        <DetailSection className="shadow-none">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserRound className="size-7" aria-hidden="true" /></span>
              <div className="min-w-0"><div className="truncate text-lg font-bold text-foreground">{fullName}</div><a href={`tel:${customer.phone}`} dir="ltr" className="number-ltr mt-1 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"><Phone className="size-3.5" aria-hidden="true" />{customer.phone}</a></div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/45 px-3 py-2 text-sm text-muted-foreground"><IdCard className="size-4" aria-hidden="true" /><span dir="ltr" className="number-ltr">{customer.nationalId}</span></div>
          </div>
        </DetailSection>

        {confirmingDelete && <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground">سيتم أرشفة العميل وإخفاؤه من السجلات النشطة. أكد الحذف للمتابعة.</div>}
        {deleteError && <InlineError>{deleteError}</InlineError>}
        <section aria-label="بيانات العميل" className="space-y-4">
            <DetailSection title="بيانات العميل" description="معلومات التواصل والهوية ورخصة القيادة.">
               <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-3 lg:grid-cols-4">
                <KeyValue label="الاسم الكامل" value={fullName} />
                <KeyValue label="رقم الهاتف" value={customer.phone} numeric />
                <KeyValue label="العنوان" value={customer.address} />
                <KeyValue label="رقم الهوية" value={customer.nationalId} numeric />
                <KeyValue label="رقم الرخصة" value={customer.licenseNumber} numeric />
                <KeyValue label={licenseExpired ? "الرخصة منتهية" : "انتهاء الرخصة"} value={formatDate(customer.licenseExpiryDate)} numeric />
              </div>
            </DetailSection>

            <DetailSection title="المستندات" description="المستندات المرتبطة ببيانات العميل.">
              <DocumentList
                documents={documents.query.data?.data ?? []}
                isLoading={documents.query.isLoading}
                isError={documents.query.isError}
                error={documents.query.error}
                isOwner={isOwner}
                uploading={documents.upload.isPending}
                updating={documents.update.isPending}
                deleting={documents.remove.isPending}
                onUpload={handleUploadDocument}
                onDelete={handleDeleteDocument}
                onDownload={handleDownloadDocument}
                onUpdateExpiry={handleUpdateDocumentExpiry}
              />
            </DetailSection>

          {currentRental && <DetailSection title="الإيجار الحالي"><div className="flex flex-wrap items-center justify-between gap-3"><StatusBadge status={currentRental.status} /><Button type="button" variant="outline" size="sm" onClick={() => setLocation(`/rentals/${currentRental.id}`)}>عرض الإيجار</Button></div></DetailSection>}
          <RentalHistorySection rentals={customerRentals.rentals} isLoading={customerRentals.isLoading} isError={customerRentals.isError} error={customerRentals.error} title="سجل الإيجارات" emptyMessage="لا توجد إيجارات لهذا العميل" />
        </section>
      </div>
    </div>
  );
}
