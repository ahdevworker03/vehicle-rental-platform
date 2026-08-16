import { useState } from "react";
import { useLocation } from "wouter";
import { Car, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { InfoRow } from "@/components/ui/InfoRow";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { VehicleStatusBadge } from "@/components/ui/VehicleStatusBadge";
import { MediaGallery } from "@/components/ui/MediaGallery";
import { DocumentList } from "@/components/ui/DocumentList";
import { RentalHistorySection } from "@/components/ui/RentalHistorySection";
import { MaintenanceHistorySection } from "@/components/ui/MaintenanceHistorySection";
import { useGetVehicle, useDeleteVehicle, getListVehiclesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { getApiErrorMessage } from "@/lib/api-error";
import { useVehiclePhotos, useVehicleDocuments } from "@/features/media/hooks";
import { useRentalsForVehicle } from "@/features/rentals/api-hooks";
import { TRANSMISSION_LABELS, FUEL_TYPE_LABELS } from "@/lib/vehicle-labels";

interface DetailPageParams {
  params: { id: string };
}

export default function VehicleDetailPage({ params }: DetailPageParams) {
  const id = params.id;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isOwner = user?.role === "OWNER";

  const { data, isLoading, isError, error } = useGetVehicle(id);
  const deleteMutation = useDeleteVehicle({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
        setLocation("/vehicles");
      },
    },
  });

  const photos = useVehiclePhotos(id);
  const documents = useVehicleDocuments(id);
  const { rentals: vehicleRentals, isLoading: rentalsLoading, isError: rentalsError, error: rentalsErr } =
    useRentalsForVehicle(id);

  async function handleUploadPhoto(file: File) {
    await photos.upload.mutateAsync({ vehicleId: id, data: { file } });
  }

  async function handleLoadPhotoContent(photo: { id: string }) {
    const blob = await photos.getContent(photo.id);
    return URL.createObjectURL(blob);
  }

  async function handleDeletePhoto(photoId: string) {
    await photos.remove.mutateAsync({ vehicleId: id, id: photoId });
  }

  async function handleUploadDocument(file: File, category: string) {
    await documents.upload.mutateAsync({
      vehicleId: id,
      data: {
        file,
        category: category as "REGISTRATION" | "INSURANCE" | "OTHER",
      },
    });
  }

  async function handleDeleteDocument(documentId: string) {
    await documents.remove.mutateAsync({ vehicleId: id, id: documentId });
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

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const vehicle = data?.data;

  if (isError || !vehicle) {
    return (
      <div className="min-h-full">
        <PageHeader title="السيارة" showBack />
        <EmptyState
          icon={Car}
          title="لا توجد بيانات"
          description={error ? getApiErrorMessage(error).title : "لم يتم العثور على هذه السيارة"}
          className="py-16"
        />
      </div>
    );
  }

  async   function handleDelete() {
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync({ id });
    } catch (err) {
      setDeleteError(getApiErrorMessage(err).title);
    }
  }

  return (
    <div className="min-h-full pb-8">
      <PageHeader
        title={`${vehicle.make} ${vehicle.model}`}
        showBack
        action={
          isOwner ? (
            <button
              onClick={() => setLocation(`/vehicles/${vehicle.id}/edit`)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-95 transition-transform"
              aria-label="تعديل السيارة"
            >
              <Pencil className="w-5 h-5" strokeWidth={2} />
            </button>
          ) : undefined
        }
      />

      <div className="px-4 pt-4 space-y-4">
        {/* Header card */}
        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <Car className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-base font-bold text-foreground truncate">
                {vehicle.make} {vehicle.model}
              </span>
              <VehicleStatusBadge status={vehicle.status} />
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {vehicle.plateNumber} · {vehicle.year}
            </div>
          </div>
        </div>

        {/* Vehicle info + Photos */}
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4">
            <h3 className="text-sm font-bold text-foreground mb-2">معلومات السيارة</h3>
            <InfoRow label="الماركة" value={vehicle.make} />
            <InfoRow label="الموديل" value={vehicle.model} />
            <InfoRow label="رقم اللوحة" value={vehicle.plateNumber} />
            <InfoRow label="السنة" value={vehicle.year} />
            <InfoRow label="اللون" value={vehicle.color} />
            {vehicle.vin && <InfoRow label="رقم الشاصي (VIN)" value={vehicle.vin} />}
            {vehicle.engineNumber && <InfoRow label="رقم المحرك" value={vehicle.engineNumber} />}
            <InfoRow label="ناقل الحركة" value={TRANSMISSION_LABELS[vehicle.transmission] ?? vehicle.transmission} />
            <InfoRow label="نوع الوقود" value={FUEL_TYPE_LABELS[vehicle.fuelType] ?? vehicle.fuelType} />
            <InfoRow label="عدد المقاعد" value={vehicle.seats} />
            <InfoRow label="المسافة المقطوعة" value={`${vehicle.currentMileage.toLocaleString("ar-LB")} كم`} />
            <InfoRow label="الحالة" value={<VehicleStatusBadge status={vehicle.status} />} />
          </div>

          <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4">
            <MediaGallery
              photos={photos.query.data?.data ?? []}
              isLoading={photos.query.isLoading}
              isError={photos.query.isError}
              error={photos.query.error}
              isOwner={isOwner}
              uploading={photos.upload.isPending}
              deleting={photos.remove.isPending}
              onUpload={handleUploadPhoto}
              onDelete={handleDeletePhoto}
              onLoadContent={handleLoadPhotoContent}
            />
          </div>
        </div>

        {/* Documents */}
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

        {/* Rental History */}
        <RentalHistorySection
          rentals={vehicleRentals}
          isLoading={rentalsLoading}
          isError={rentalsError}
          error={rentalsErr}
          title="سجل الإيجارات"
          emptyMessage="لا توجد إيجارات لهذه السيارة"
        />

        {/* Maintenance History */}
        <MaintenanceHistorySection vehicleId={vehicle.id} />

        {/* Delete (OWNER only) */}
        {isOwner && (
          <div className="space-y-2">
            {deleteError && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive">
                {deleteError}
              </div>
            )}
            {confirmingDelete ? (
              <div className="bg-card rounded-2xl border border-destructive/40 shadow-sm p-4 space-y-3">
                <p className="text-sm text-foreground">هل أنت متأكد من حذف هذه السيارة؟</p>
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
                حذف السيارة
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
