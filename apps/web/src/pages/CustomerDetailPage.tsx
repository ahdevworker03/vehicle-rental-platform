import { useState } from "react";
import { useLocation } from "wouter";
import { Users, Phone, MapPin, Pencil, Trash2, IdCard } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { InfoRow } from "@/components/ui/InfoRow";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { DocumentList } from "@/components/ui/DocumentList";
import { RentalHistorySection } from "@/components/ui/RentalHistorySection";
import { formatDateAr, formatInitials } from "@/lib/format";
import { useAuth } from "@/providers/AuthProvider";
import { useRentalsForCustomer } from "@/features/rentals/api-hooks";
import {
  useGetCustomer,
  useDeleteCustomer,
  getListCustomersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/api-error";
import { useCustomerDocuments } from "@/features/media/hooks";

interface DetailPageParams {
  params: { id: string };
}

export default function CustomerDetailPage({ params }: DetailPageParams) {
  const id = params.id;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = user?.role === "OWNER";

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useGetCustomer(id);
  const deleteMutation = useDeleteCustomer({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
        setLocation("/customers");
      },
    },
  });

  const documents = useCustomerDocuments(id);
  const { rentals: customerRentals, isLoading: rentalsLoading, isError: rentalsError, error: rentalsErr } =
    useRentalsForCustomer(id);

  async function handleUploadDocument(file: File, category: string) {
    await documents.upload.mutateAsync({
      customerId: id,
      data: {
        file,
        category: category as "REGISTRATION" | "INSURANCE" | "OTHER",
      },
    });
  }

  async function handleDeleteDocument(documentId: string) {
    await documents.remove.mutateAsync({ customerId: id, id: documentId });
  }

  async function handleDownloadDocument(doc: { id: string; originalFilename: string }) {
    const blob = await documents.download(doc.id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.originalFilename || "document";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function handleDelete() {
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync({ id });
    } catch (err) {
      setDeleteError(getApiErrorMessage(err).title);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const customer = data?.data;

  if (isError || !customer) {
    return (
      <div className="min-h-full">
        <PageHeader title="العميل" showBack />
        <EmptyState
          icon={Users}
          title="لا توجد بيانات"
          description={error ? getApiErrorMessage(error).title : "لم يتم العثور على هذا العميل"}
          className="py-16"
        />
      </div>
    );
  }

  const fullName = `${customer.firstName} ${customer.lastName}`.trim();

  return (
    <div className="min-h-full pb-8">
      <PageHeader
        title={fullName}
        showBack
        action={
          isOwner ? (
            <button
              onClick={() => setLocation(`/customers/${customer.id}/edit`)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-95 transition-transform"
              aria-label="تعديل العميل"
            >
              <Pencil className="w-5 h-5" strokeWidth={2} />
            </button>
          ) : undefined
        }
      />

      <div className="px-4 pt-4 space-y-4">
        {/* ── Contact + Identity ─────────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        {/* ── Contact Card ─────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-5 border-b border-border">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
              {formatInitials(fullName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-foreground">{fullName}</div>
              {customer.address && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>{customer.address}</span>
                </div>
              )}
            </div>
            <a
              href={`tel:${customer.phone}`}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-[hsl(var(--status-available-bg))] text-[hsl(var(--status-available))] active:scale-95 transition-transform flex-shrink-0"
              aria-label="اتصال"
            >
              <Phone className="w-5 h-5" strokeWidth={1.75} />
            </a>
          </div>

          <div className="px-4">
            <InfoRow label="رقم الهاتف" value={customer.phone} />
            <InfoRow label="العنوان" value={customer.address} />
          </div>
        </div>

        {/* ── Identity & License ───────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <IdCard className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
            <h3 className="text-sm font-bold text-foreground">الهوية والرخصة</h3>
          </div>
          <InfoRow label="رقم الهوية" value={customer.nationalId} />
          <InfoRow label="رقم الرخصة" value={customer.licenseNumber} />
          <InfoRow label="انتهاء الرخصة" value={formatDateAr(customer.licenseExpiryDate)} />
        </div>
        </div>

        {/* ── Documents ────────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 max-w-2xl">
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
        </div>

        {/* ── Rental History ──────────────────────────────────────── */}
        <RentalHistorySection
          rentals={customerRentals}
          isLoading={rentalsLoading}
          isError={rentalsError}
          error={rentalsErr}
          title="سجل الإيجارات"
          emptyMessage="لا توجد إيجارات لهذا العميل"
        />

        {/* ── Delete (OWNER only) ──────────────────────────────────── */}
        {isOwner && (
          <div className="space-y-2">
            {deleteError && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive">
                {deleteError}
              </div>
            )}
            {confirmingDelete ? (
              <div className="bg-card rounded-2xl border border-destructive/40 shadow-sm p-4 space-y-3">
                <p className="text-sm text-foreground">
                  هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="flex-1 rounded-xl py-3 text-sm font-semibold bg-muted text-foreground active:scale-[0.98] transition-transform"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="flex-1 rounded-xl py-3 text-sm font-semibold bg-destructive text-destructive-foreground active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
                  >
                    {deleteMutation.isPending ? <Spinner /> : <Trash2 className="size-4" />}
                    حذف
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="w-full rounded-2xl py-4 text-base font-bold text-destructive border border-destructive/30 bg-destructive/5 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <Trash2 className="size-5" />
                حذف العميل
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
