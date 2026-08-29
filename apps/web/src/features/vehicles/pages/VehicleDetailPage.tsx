import { useState } from "react";
import { useLocation } from "wouter";
import { Car, Pencil, Trash2 } from "lucide-react";
import { useVehicleMutations, useVehicleRecord } from "@/features/vehicles/api-hooks";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DocumentList, MediaGallery } from "@/features/media";
import { ErrorState, InfoBanner, InlineError, LoadingState } from "@/components/ui/FeedbackState";
import { MaintenanceHistorySection } from "@/features/maintenance";
import { RentalHistorySection } from "@/features/rentals";
import { DetailSection, SummaryActionPanel } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useVehicleDocuments, useVehiclePhotos } from "@/features/media/hooks";
import { useRentalsForVehicle } from "@/features/rentals/api-hooks";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatNumber } from "@/lib/format";
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS } from "@/lib/vehicle-labels";
import { useAuth } from "@/providers/AuthProvider";

interface DetailPageParams {
  params: { id: string };
}

export default function VehicleDetailPage({ params }: DetailPageParams) {
  const { id } = params;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const isOwner = user?.role === "OWNER";
  const vehicleQuery = useVehicleRecord(id);
  const photos = useVehiclePhotos(id);
  const documents = useVehicleDocuments(id);
  const vehicleRentals = useRentalsForVehicle(id);
  const { remove: deleteMutation } = useVehicleMutations();

  async function handleUploadPhoto(file: File) {
    await photos.upload.mutateAsync({ vehicleId: id, data: { file } });
  }

  async function handleLoadPhotoContent(photo: { id: string }) {
    return URL.createObjectURL(await photos.getContent(photo.id));
  }

  async function handleDeletePhoto(photoId: string) {
    await photos.remove.mutateAsync({ vehicleId: id, id: photoId });
  }

  async function handleUploadDocument(file: File, category: string) {
    await documents.upload.mutateAsync({ vehicleId: id, data: { file, category: category as "REGISTRATION" | "INSURANCE" | "OTHER" } });
  }

  async function handleDeleteDocument(documentId: string) {
    await documents.remove.mutateAsync({ vehicleId: id, id: documentId });
  }

  async function handleUpdateDocumentExpiry(documentId: string, expiryDate: string | null) {
    await documents.update.mutateAsync({ vehicleId: id, id: documentId, data: { expiryDate } });
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
      setLocation("/vehicles");
    } catch (error) {
      setDeleteError(getApiErrorMessage(error).title);
    }
  }

  if (vehicleQuery.isLoading) return <div className="min-h-full"><PageHeader title="تفاصيل المركبة" showBack /><div className="px-4 py-6 sm:px-6"><LoadingState rows={5} /></div></div>;
  const vehicle = vehicleQuery.data?.data;
  if (vehicleQuery.isError || !vehicle) return <div className="min-h-full"><PageHeader title="تفاصيل المركبة" showBack /><ErrorState className="py-16" title="تعذر تحميل المركبة" description={vehicleQuery.error ? getApiErrorMessage(vehicleQuery.error).title : "لم يتم العثور على هذه المركبة."} onRetry={() => void vehicleQuery.refetch()} /></div>;

  const currentRental = vehicleRentals.rentals.find((rental) => rental.status === "ACTIVE" || rental.status === "RESERVED");

  return (
    <div className="min-h-full pb-8">
      <PageHeader
        title="تفاصيل المركبة"
        showBack
        action={isOwner ? <Button type="button" size="sm" onClick={() => setLocation(`/vehicles/${vehicle.id}/edit`)}><Pencil className="size-4" aria-hidden="true" />تعديل</Button> : undefined}
      />

      <div className="space-y-4 px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        <DetailSection className="shadow-none">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Car className="size-7" aria-hidden="true" /></span>
              <div className="min-w-0"><div dir="ltr" className="truncate text-lg font-bold text-foreground">{vehicle.make} {vehicle.model}</div><div dir="ltr" className="number-ltr mt-1 text-sm text-muted-foreground">{vehicle.plateNumber} · {vehicle.year}</div></div>
            </div>
            <div><div className="ui-label mb-1">حالة المركبة</div><StatusBadge status={vehicle.status} /></div>
          </div>
        </DetailSection>

        <div className="grid gap-4 xl:grid-cols-12 xl:items-start">
          <aside className="order-1 xl:order-2 xl:col-span-4">
            <SummaryActionPanel title="إجراءات المركبة" description="إدارة بيانات المركبة وسجلها التشغيلي.">
              <div className="space-y-3">
                {isOwner && !confirmingDelete && (
                  <Button type="button" variant="outline" className="w-full" onClick={() => setLocation("/vehicles/" + vehicle.id + "/edit")}>
                    <Pencil className="size-4" aria-hidden="true" />
                    تعديل المركبة
                  </Button>
                )}
                {currentRental ? (
                  <div className="rounded-lg bg-muted/45 p-3">
                    <div className="ui-label">الإيجار الحالي</div>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <StatusBadge status={currentRental.status} />
                      <Button type="button" variant="ghost" size="sm" onClick={() => setLocation("/rentals/" + currentRental.id)}>عرض الإيجار</Button>
                    </div>
                  </div>
                ) : <InfoBanner>لا يوجد إيجار نشط أو حجز مرتبط بهذه المركبة.</InfoBanner>}
                {isOwner && (
                  confirmingDelete ? (
                    <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                      <p className="text-sm text-foreground">هل تريد حذف هذه المركبة؟</p>
                      {deleteError && <InlineError>{deleteError}</InlineError>}
                      <div className="grid grid-cols-2 gap-2"><Button type="button" variant="outline" onClick={() => setConfirmingDelete(false)} disabled={deleteMutation.isPending}>إلغاء</Button><Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? "جارٍ الحذف" : "حذف"}</Button></div>
                    </div>
                  ) : <Button type="button" variant="outline" className="w-full border-destructive/40 text-destructive hover:bg-destructive/5" onClick={() => setConfirmingDelete(true)}><Trash2 className="size-4" aria-hidden="true" />حذف المركبة</Button>
                )}
              </div>
            </SummaryActionPanel>
          </aside>

          <section aria-label="بيانات المركبة" className="order-2 space-y-4 xl:order-1 xl:col-span-8">
            <DetailSection title="بيانات المركبة" description="الهوية والمواصفات الأساسية للمركبة.">
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                <KeyValue label="الشركة المصنعة" value={vehicle.make} ltr />
                <KeyValue label="الطراز" value={vehicle.model} ltr />
                <KeyValue label="رقم اللوحة" value={vehicle.plateNumber} ltr />
                <KeyValue label="سنة الصنع" value={vehicle.year} numeric />
                <KeyValue label="اللون" value={vehicle.color} />
                <KeyValue label="ناقل الحركة" value={TRANSMISSION_LABELS[vehicle.transmission] ?? vehicle.transmission} />
                <KeyValue label="نوع الوقود" value={FUEL_TYPE_LABELS[vehicle.fuelType] ?? vehicle.fuelType} />
                <KeyValue label="عدد المقاعد" value={vehicle.seats} numeric />
                <KeyValue label="العداد الحالي" value={`${formatNumber(vehicle.currentMileage)} كم`} numeric />
                {vehicle.vin && <KeyValue label="رقم الشاصي (VIN)" value={vehicle.vin} ltr />}
                {vehicle.engineNumber && <KeyValue label="رقم المحرك" value={vehicle.engineNumber} ltr />}
              </div>
            </DetailSection>

            <DetailSection>
              <MediaGallery photos={photos.query.data?.data ?? []} isLoading={photos.query.isLoading} isError={photos.query.isError} error={photos.query.error} isOwner={isOwner} uploading={photos.upload.isPending} deleting={photos.remove.isPending} onUpload={handleUploadPhoto} onDelete={handleDeletePhoto} onLoadContent={handleLoadPhotoContent} />
            </DetailSection>

            <DetailSection><DocumentList documents={documents.query.data?.data ?? []} isLoading={documents.query.isLoading} isError={documents.query.isError} error={documents.query.error} isOwner={isOwner} uploading={documents.upload.isPending} updating={documents.update.isPending} deleting={documents.remove.isPending} onUpload={handleUploadDocument} onDelete={handleDeleteDocument} onDownload={handleDownloadDocument} onUpdateExpiry={handleUpdateDocumentExpiry} /></DetailSection>
            <RentalHistorySection rentals={vehicleRentals.rentals} isLoading={vehicleRentals.isLoading} isError={vehicleRentals.isError} error={vehicleRentals.error} title="سجل الإيجارات" emptyMessage="لا توجد إيجارات لهذه المركبة" />
            <MaintenanceHistorySection vehicleId={vehicle.id} />
          </section>
        </div>
      </div>
    </div>
  );
}

function KeyValue({ label, value, numeric = false, ltr = false }: { label: string; value: string | number; numeric?: boolean; ltr?: boolean }) {
  return <div className="min-w-0"><div className="ui-label">{label}</div><div dir={ltr ? "ltr" : undefined} className={`mt-1.5 truncate text-sm font-semibold text-foreground ${numeric ? "number-ltr" : ""}`}>{value}</div></div>;
}
