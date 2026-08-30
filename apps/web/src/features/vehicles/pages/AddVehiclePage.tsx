import { useRef, useState } from "react";
import { useLocation } from "wouter";
import { FileText, ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import {
  useUploadVehicleDocument,
  useUploadVehiclePhoto,
  type DocumentResponseCategory,
  type VehicleResponseStatus,
} from "@workspace/api-client-react";
import { useVehicleMutations } from "@/features/vehicles/api-hooks";
import {
  VehicleFormFields,
  type VehicleFormState,
} from "@/features/vehicles/components/VehicleFormFields";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { InlineError } from "@/components/ui/FeedbackState";
import { SectionCard } from "@/components/ui/SectionCard";
import { getApiErrorMessage } from "@/lib/api-error";

const CURRENT_YEAR = new Date().getFullYear();

const INITIAL: VehicleFormState = {
  make: "",
  model: "",
  plate_number: "",
  year: "",
  color: "",
  notes: "",
  transmission: "AUTOMATIC",
  fuel_type: "PETROL",
  seats: "",
  current_mileage: "",
  status: "AVAILABLE",
};

interface PendingPhoto {
  id: string;
  file: File;
}

interface PendingDocument {
  id: string;
  file: File;
  category: DocumentResponseCategory;
}

export default function AddVehiclePage() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<VehicleFormState>(INITIAL);
  const [errors, setErrors] = useState<
    Partial<Record<keyof VehicleFormState, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [documents, setDocuments] = useState<PendingDocument[]>([]);
  const [createdVehicleId, setCreatedVehicleId] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const { create: createMutation } = useVehicleMutations();
  const uploadPhotoMutation = useUploadVehiclePhoto();
  const uploadDocumentMutation = useUploadVehicleDocument();

  function set<K extends keyof VehicleFormState>(
    field: K,
    value: VehicleFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field])
      setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof VehicleFormState, string>> = {};
    if (!form.make.trim()) nextErrors.make = "هذا الحقل مطلوب.";
    if (!form.model.trim()) nextErrors.model = "هذا الحقل مطلوب.";
    if (!form.plate_number.trim()) nextErrors.plate_number = "هذا الحقل مطلوب.";
    if (!form.color.trim()) nextErrors.color = "هذا الحقل مطلوب.";
    const year = Number(form.year);
    if (
      !form.year ||
      Number.isNaN(year) ||
      year < 1900 ||
      year > CURRENT_YEAR + 1
    )
      nextErrors.year = "أدخل سنة صحيحة.";
    const seats = Number(form.seats);
    if (
      !form.seats ||
      Number.isNaN(seats) ||
      !Number.isInteger(seats) ||
      seats <= 0
    )
      nextErrors.seats = "أدخل عدد مقاعد صحيحاً موجباً.";
    const mileage = Number(form.current_mileage);
    if (
      !form.current_mileage ||
      Number.isNaN(mileage) ||
      !Number.isInteger(mileage) ||
      mileage < 0
    )
      nextErrors.current_mileage = "أدخل مسافة صحيحة غير سالبة.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (
      createMutation.isPending ||
      uploadPhotoMutation.isPending ||
      uploadDocumentMutation.isPending ||
      (!createdVehicleId && !validate())
    )
      return;
    setFormError(null);
    let vehicleId = createdVehicleId;
    try {
      vehicleId =
        vehicleId ??
        (
          await createMutation.mutateAsync({
            data: {
              make: form.make.trim(),
              model: form.model.trim(),
              plate_number: form.plate_number.trim(),
              year: Number(form.year),
              color: form.color.trim(),
              notes: form.notes.trim() || undefined,
              transmission: form.transmission,
              fuel_type: form.fuel_type,
              seats: Number(form.seats),
              current_mileage: Number(form.current_mileage),
              status: form.status as VehicleResponseStatus,
            },
          })
        ).data.id;
      setCreatedVehicleId(vehicleId);
      if (!vehicleId) throw new Error("Vehicle creation did not return an ID.");
      const confirmedVehicleId = vehicleId;

      const photoUploads = await Promise.allSettled(
        photos.map((photo) =>
          uploadPhotoMutation.mutateAsync({
            vehicleId: confirmedVehicleId,
            data: { file: photo.file },
          }),
        ),
      );
      const failedPhotoIds = new Set(
        photos.flatMap((photo, index) =>
          photoUploads[index].status === "rejected" ? [photo.id] : [],
        ),
      );
      setPhotos((current) =>
        current.filter((photo) => failedPhotoIds.has(photo.id)),
      );
      if (failedPhotoIds.size > 0) throw new Error("Photo upload failed.");

      const documentUploads = await Promise.allSettled(
        documents.map((document) =>
          uploadDocumentMutation.mutateAsync({
            vehicleId: confirmedVehicleId,
            data: { file: document.file, category: document.category },
          }),
        ),
      );
      const failedDocumentIds = new Set(
        documents.flatMap((document, index) =>
          documentUploads[index].status === "rejected" ? [document.id] : [],
        ),
      );
      setDocuments((current) =>
        current.filter((document) => failedDocumentIds.has(document.id)),
      );
      if (failedDocumentIds.size > 0)
        throw new Error("Document upload failed.");

      setLocation(`/vehicles/${vehicleId}`);
    } catch (error) {
      setFormError(
        vehicleId
          ? "تم إنشاء المركبة، لكن تعذر رفع بعض الصور أو المستندات. أعد المحاولة أو أضفها من صفحة المركبة."
          : getApiErrorMessage(error).title,
      );
    }
  }

  const canSave = Boolean(
    form.make.trim() &&
    form.model.trim() &&
    form.plate_number.trim() &&
    form.color.trim() &&
    form.year.trim() &&
    form.seats.trim() &&
    form.current_mileage.trim(),
  );

  return (
    <div className="min-h-full pb-6">
      <PageHeader title="إضافة مركبة" showBack />
      <div className="mx-auto max-w-5xl space-y-4 px-4 pb-6 pt-4 sm:px-6 lg:space-y-5">
        <div>
          <h2 className="ui-page-title">بيانات المركبة</h2>
          <p className="ui-secondary-text mt-1">
            أدخل هوية المركبة ومواصفاتها قبل إضافتها إلى الأسطول.
          </p>
        </div>
        {formError && (
          <InlineError className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            {formError}
          </InlineError>
        )}
        <VehicleFormFields form={form} errors={errors} onChange={set} />
        <SectionCard
          title="ملفات المركبة"
          description="اختيارية. تُرفع الصور والمستندات بعد حفظ بيانات المركبة بنجاح."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <section
              aria-labelledby="vehicle-photos-title"
              className="min-w-0 space-y-3"
            >
              <div>
                <h3
                  id="vehicle-photos-title"
                  className="text-sm font-semibold text-foreground"
                >
                  صور المركبة
                </h3>
                <p className="ui-secondary-text mt-1">صور JPG وPNG وWEBP.</p>
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  setPhotos((current) => [
                    ...current,
                    ...files.map((file) => ({
                      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
                      file,
                    })),
                  ]);
                  event.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => photoInputRef.current?.click()}
                disabled={
                  createMutation.isPending ||
                  uploadPhotoMutation.isPending ||
                  uploadDocumentMutation.isPending
                }
              >
                <Plus className="size-4" aria-hidden="true" />
                إضافة صور
              </Button>
              {photos.length > 0 ? (
                <div className="divide-y divide-border rounded-lg border border-border">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="flex min-w-0 items-center gap-3 px-3 py-2.5"
                    >
                      <ImageIcon
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span
                        className="min-w-0 flex-1 truncate text-sm font-medium text-foreground"
                        dir="auto"
                      >
                        {photo.file.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:bg-destructive/5"
                        onClick={() =>
                          setPhotos((current) =>
                            current.filter((item) => item.id !== photo.id),
                          )
                        }
                        aria-label={`إزالة الصورة ${photo.file.name}`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="ui-secondary-text">
                  يمكن إضافة الصور الآن أو لاحقاً من صفحة المركبة.
                </p>
              )}
            </section>
            <section
              aria-labelledby="vehicle-documents-title"
              className="min-w-0 space-y-3"
            >
              <div>
                <h3
                  id="vehicle-documents-title"
                  className="text-sm font-semibold text-foreground"
                >
                  مستندات المركبة
                </h3>
                <p className="ui-secondary-text mt-1">
                  ملفات PDF أو صور JPG وPNG.
                </p>
              </div>
              <input
                ref={documentInputRef}
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                multiple
                className="hidden"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  setDocuments((current) => [
                    ...current,
                    ...files.map((file) => ({
                      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
                      file,
                      category: "OTHER" as const,
                    })),
                  ]);
                  event.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => documentInputRef.current?.click()}
                disabled={
                  createMutation.isPending ||
                  uploadPhotoMutation.isPending ||
                  uploadDocumentMutation.isPending
                }
              >
                <Plus className="size-4" aria-hidden="true" />
                إضافة مستند
              </Button>
              {documents.length > 0 ? (
                <div className="divide-y divide-border rounded-lg border border-border">
                  {documents.map((document) => (
                    <div
                      key={document.id}
                      className="flex flex-wrap items-center gap-3 px-3 py-2.5"
                    >
                      <FileText
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span
                        className="min-w-0 flex-1 truncate text-sm font-medium text-foreground"
                        dir="auto"
                      >
                        {document.file.name}
                      </span>
                      <select
                        aria-label={`نوع المستند ${document.file.name}`}
                        value={document.category}
                        onChange={(event) =>
                          setDocuments((current) =>
                            current.map((item) =>
                              item.id === document.id
                                ? {
                                    ...item,
                                    category: event.target
                                      .value as DocumentResponseCategory,
                                  }
                                : item,
                            ),
                          )
                        }
                        className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
                      >
                        <option value="REGISTRATION">تسجيل</option>
                        <option value="INSURANCE">تأمين</option>
                        <option value="OTHER">أخرى</option>
                      </select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:bg-destructive/5"
                        onClick={() =>
                          setDocuments((current) =>
                            current.filter((item) => item.id !== document.id),
                          )
                        }
                        aria-label={`إزالة المستند ${document.file.name}`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="ui-secondary-text">
                  يمكن إضافة الملفات الآن أو لاحقاً من صفحة المركبة.
                </p>
              )}
            </section>
          </div>
        </SectionCard>
        <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-border bg-background/95 py-3 backdrop-blur-sm">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation("/vehicles")}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              (!createdVehicleId && !canSave) ||
              createMutation.isPending ||
              uploadPhotoMutation.isPending ||
              uploadDocumentMutation.isPending
            }
          >
            {createMutation.isPending ||
            uploadPhotoMutation.isPending ||
            uploadDocumentMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                جارٍ الحفظ
              </>
            ) : createdVehicleId ? (
              "إعادة رفع الملفات"
            ) : (
              "حفظ المركبة"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
