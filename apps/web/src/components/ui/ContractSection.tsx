import { useRef, useState } from "react";
import {
  FileText,
  Plus,
  Download,
  Trash2,
  Loader2,
  Printer,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import { InfoRow } from "@/components/ui/InfoRow";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/providers/AuthProvider";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatDateAr } from "@/lib/format";
import { formatFileSize, formatDate } from "@/lib/media-labels";
import { useRentalContract, useRentalContractSignedDocuments } from "@/features/contracts/hooks";
import type { DocumentResponse } from "@workspace/api-client-react";

interface ContractSectionProps {
  rentalId: string;
}

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ContractSection({ rentalId }: ContractSectionProps) {
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contract = useRentalContract(rentalId);
  const signed = useRentalContractSignedDocuments(rentalId);

  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const data = contract.query.data?.data;

  async function handleGenerate() {
    setLocalError(null);
    try {
      await contract.generate.mutateAsync({ id: rentalId });
      setSuccessMsg("تم إنشاء العقد بنجاح");
    } catch (err) {
      setLocalError(getApiErrorMessage(err).title);
    }
  }

  async function handlePrintable() {
    setLocalError(null);
    try {
      const html = await contract.printable();
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setLocalError(getApiErrorMessage(err).title);
    }
  }

  async function handleDownloadPdf() {
    if (downloadingPdf) return;
    setDownloadingPdf(true);
    setLocalError(null);
    try {
      const blob = await contract.pdf();
      triggerDownload(blob, `contract-${rentalId}.pdf`);
    } catch (err) {
      setLocalError(getApiErrorMessage(err).title);
    } finally {
      setDownloadingPdf(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setLocalError("نوع الملف غير مدعوم. يُقبل PDF أو JPEG أو PNG فقط.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setLocalError("حجم الملف يتجاوز الحد الأقصى (10 م.ب).");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      await signed.upload.mutateAsync({ id: rentalId, data: { file } });
      setSuccessMsg("تم رفع العقد الموقّع بنجاح");
    } catch (err) {
      setLocalError(getApiErrorMessage(err).title);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDownloadDocument(doc: DocumentResponse) {
    if (downloadingId) return;
    setDownloadingId(doc.id);
    setLocalError(null);
    try {
      const blob = await signed.download(doc.id);
      triggerDownload(blob, doc.originalFilename || `signed-contract-${doc.id}`);
    } catch (err) {
      setLocalError(getApiErrorMessage(err).title);
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDeleteDocument(doc: DocumentResponse) {
    setLocalError(null);
    try {
      await signed.remove.mutateAsync({ id: rentalId, documentId: doc.id });
      setConfirmDeleteId(null);
      setSuccessMsg("تم حذف المستند");
    } catch (err) {
      setLocalError(getApiErrorMessage(err).title);
    }
  }

  const generating = contract.generate.isPending;
  const uploading = signed.upload.isPending;
  const deleting = signed.remove.isPending;

  return (
    <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">العقد</h3>
        {data && (
          <span className="text-xs text-muted-foreground">#{data.id.slice(0, 8)}</span>
        )}
      </div>

      {(localError || successMsg) && (
        <div
          className={
            localError
              ? "bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-2.5 text-sm text-destructive flex items-center gap-2"
              : "bg-[hsl(var(--status-available-bg))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--status-available))] flex items-center gap-2"
          }
        >
          {localError ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
          ) : (
            <CheckCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
          )}
          <span>{localError ?? successMsg}</span>
        </div>
      )}

      {contract.query.isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner />
        </div>
      ) : contract.query.isError ? (
        <div className="text-sm text-muted-foreground text-center py-4">
          {contract.query.error
            ? getApiErrorMessage(contract.query.error).title
            : "حدث خطأ في تحميل العقد"}
        </div>
      ) : !data ? (
        <div className="text-center py-6 space-y-3">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">لا يوجد عقد لهذا الإيجار</p>
          {isOwner && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              {generating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              إنشاء العقد
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Contract snapshot info */}
          <div className="space-y-1">
            <InfoRow
              label="العميل"
              value={`${data.customerFirstName} ${data.customerLastName}`}
            />
            <InfoRow label="رقم الهوية" value={data.customerNationalId} />
            <InfoRow
              label="السيارة"
              value={`${data.vehicleMake} ${data.vehicleModel} (${data.vehiclePlateNumber})`}
            />
            <InfoRow label="تاريخ الاستلام" value={formatDateAr(data.pickupDate)} />
            <InfoRow label="تاريخ الإرجاع" value={formatDateAr(data.expectedReturnDate)} />
            <InfoRow label="الأجرة اليومية" value={formatCurrency(data.dailyRate)} />
            <InfoRow label="الإجمالي" value={formatCurrency(data.totalAmount)} />
            <InfoRow label="التأمين" value={formatCurrency(data.depositAmount)} />
          </div>

          {/* Printable + PDF actions */}
          <div className="space-y-2">
            <button
              onClick={handlePrintable}
              className="w-full flex items-center justify-center gap-2 border-2 border-primary text-primary rounded-xl py-3 text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              <Printer className="size-4" strokeWidth={2} />
              نسخة للطباعة
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              {downloadingPdf ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" strokeWidth={2} />
              )}
              تحميل PDF
            </button>
          </div>

          {/* Signed documents */}
          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-foreground">العقد الموقّع</h4>
              {isOwner && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 text-sm font-semibold text-primary px-3 py-1.5 rounded-lg active:bg-muted/50 transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  رفع
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              className="hidden"
              onChange={handleFileChange}
            />

            {signed.query.isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            ) : signed.query.isError ? (
              <p className="text-xs text-muted-foreground text-center py-3">
                {signed.query.error
                  ? getApiErrorMessage(signed.query.error).title
                  : "حدث خطأ في تحميل المستندات"}
              </p>
            ) : (signed.query.data?.data ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">
                لا يوجد عقد موقّع مرفوع
              </p>
            ) : (
              <div className="space-y-2">
                {(signed.query.data?.data ?? []).map((doc) => (
                  <div key={doc.id} className="space-y-2">
                    <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">
                          {doc.originalFilename}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {formatFileSize(doc.fileSize)} · {formatDate(doc.createdAt)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadDocument(doc)}
                        disabled={downloadingId !== null}
                        className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground active:scale-95 transition-transform flex-shrink-0"
                        aria-label="تحميل المستند"
                      >
                        {downloadingId === doc.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Download className="size-4" />
                        )}
                      </button>
                      {isOwner && (
                        <button
                          onClick={() => setConfirmDeleteId(confirmDeleteId === doc.id ? null : doc.id)}
                          disabled={deleting}
                          className="w-9 h-9 flex items-center justify-center rounded-full text-destructive active:scale-95 transition-transform flex-shrink-0"
                          aria-label="حذف المستند"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                    {confirmDeleteId === doc.id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={deleting}
                          className="flex-1 border border-border text-foreground rounded-lg py-2 text-xs font-semibold active:scale-[0.98] transition-transform"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc)}
                          disabled={deleting}
                          className="flex-1 bg-destructive text-destructive-foreground rounded-lg py-2 text-xs font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-1"
                        >
                          {deleting ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Trash2 className="size-3" />
                          )}
                          حذف
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
