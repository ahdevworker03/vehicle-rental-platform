import { useState } from "react";
import { useLocation } from "wouter";
import { IdCard, Pencil, Phone, Trash2, UserRound } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListCustomersQueryKey, useDeleteCustomer, useGetCustomer } from "@workspace/api-client-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DocumentList } from "@/components/ui/DocumentList";
import { ErrorState, InlineError, LoadingState } from "@/components/ui/FeedbackState";
import { RentalHistorySection } from "@/components/ui/RentalHistorySection";
import { DetailSection, SummaryActionPanel } from "@/components/ui/SectionCard";
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
    <div className="min-w-0">
      <div className="ui-label">{label}</div>
      <div dir={numeric ? "ltr" : undefined} className={`mt-1 break-words text-sm font-semibold text-foreground ${numeric ? "number-ltr" : ""}`}>{value || "—"}</div>
    </div>
  );
}

export default function CustomerDetailPage({ params }: DetailPageParams) {
  const { id } = params;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = user?.role === "OWNER";
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const customerQuery = useGetCustomer(id);
  const documents = useCustomerDocuments(id);
  const customerRentals = useRentalsForCustomer(id);
  const deleteMutation = useDeleteCustomer({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
        setLocation("/customers");
      },
    },
  });

  async function handleUploadDocument(file: File, category: string) {
    await documents.upload.mutateAsync({ customerId: id, data: { file, category: category as "REGISTRATION" | "INSURANCE" | "OTHER" } });
  }

  async function handleDeleteDocument(documentId: string) {
    await documents.remove.mutateAsync({ customerId: id, id: documentId });
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
    } catch (error) {
      setDeleteError(getApiErrorMessage(error).title);
    }
  }

  if (customerQuery.isLoading) return <div className="min-h-full"><PageHeader title="تفاصيل العميل" showBack /><div className="px-4 py-6 sm:px-6"><LoadingState rows={5} /></div></div>;
  const customer = customerQuery.data?.data;
  if (customerQuery.isError || !customer) return <div className="min-h-full"><PageHeader title="تفاصيل العميل" showBack /><ErrorState className="py-16" title="تعذر تحميل العميل" description={customerQuery.error ? getApiErrorMessage(customerQuery.error).title : "لم يتم العثور على هذا العميل."} onRetry={() => void customerQuery.refetch()} /></div>;

  const fullName = `${customer.firstName} ${customer.lastName}`.trim();

  return (
    <div className="min-h-full pb-8">
      <PageHeader title="تفاصيل العميل" showBack action={isOwner ? <Button type="button" size="sm" onClick={() => setLocation(`/customers/${customer.id}/edit`)}><Pencil className="size-4" aria-hidden="true" />تعديل</Button> : undefined} />

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

        <div className="grid gap-4 xl:grid-cols-12 xl:items-start">
          <aside className="order-1 xl:order-2 xl:col-span-4">
            <SummaryActionPanel title="إجراءات العميل" description="إدارة بيانات العميل وسجل إجارته.">
              <div className="space-y-3">
                {isOwner && !confirmingDelete && <Button type="button" variant="outline" className="w-full" onClick={() => setLocation(`/customers/${customer.id}/edit`)}><Pencil className="size-4" aria-hidden="true" />تعديل العميل</Button>}
                {isOwner && (confirmingDelete ? (
                  <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-sm text-foreground">هل تريد حذف هذا العميل؟</p>
                    {deleteError && <InlineError>{deleteError}</InlineError>}
                    <div className="grid grid-cols-2 gap-2"><Button type="button" variant="outline" onClick={() => setConfirmingDelete(false)} disabled={deleteMutation.isPending}>إلغاء</Button><Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? "جارٍ الحذف" : "حذف"}</Button></div>
                  </div>
                ) : <Button type="button" variant="outline" className="w-full border-destructive/40 text-destructive hover:bg-destructive/5" onClick={() => setConfirmingDelete(true)}><Trash2 className="size-4" aria-hidden="true" />حذف العميل</Button>)}
              </div>
            </SummaryActionPanel>
          </aside>

          <section aria-label="بيانات العميل" className="order-2 space-y-4 xl:order-1 xl:col-span-8">
            <DetailSection title="بيانات العميل" description="معلومات التواصل والهوية ورخصة القيادة.">
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                <KeyValue label="الاسم الكامل" value={fullName} />
                <KeyValue label="رقم الهاتف" value={customer.phone} numeric />
                <KeyValue label="العنوان" value={customer.address} />
                <KeyValue label="رقم الهوية" value={customer.nationalId} numeric />
                <KeyValue label="رقم الرخصة" value={customer.licenseNumber} numeric />
                <KeyValue label="انتهاء الرخصة" value={formatDate(customer.licenseExpiryDate)} numeric />
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
                deleting={documents.remove.isPending}
                onUpload={handleUploadDocument}
                onDelete={handleDeleteDocument}
                onDownload={handleDownloadDocument}
              />
            </DetailSection>

            <RentalHistorySection rentals={customerRentals.rentals} isLoading={customerRentals.isLoading} isError={customerRentals.isError} error={customerRentals.error} title="سجل الإيجارات" emptyMessage="لا توجد إيجارات لهذا العميل" />
          </section>
        </div>
      </div>
    </div>
  );
}
