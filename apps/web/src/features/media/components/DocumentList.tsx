import { useRef, useState } from "react";
import { Plus, FileText, Trash2, Download, Loader2, Pencil } from "lucide-react";
import type { DocumentResponse } from "@workspace/api-client-react";
import { useAuth } from "@/providers/AuthProvider";
import { InlineFeedback } from "@/components/ui/FeedbackState";
import { getApiErrorMessage } from "@/lib/api-error";
import { DOCUMENT_CATEGORY_LABELS } from "@/lib/media-labels";
import { formatDate } from "@/lib/format";

interface DocumentListProps {
  documents: DocumentResponse[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isOwner: boolean;
  uploading: boolean;
  deleting: boolean;
  updating?: boolean;
  onUpload: (file: File, category: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDownload: (doc: DocumentResponse) => Promise<void>;
  onUpdateExpiry?: (id: string, expiryDate: string | null) => Promise<void>;
}

export function DocumentList({
  documents,
  isLoading,
  isError,
  error,
  isOwner,
  uploading,
  deleting,
  updating = false,
  onUpload,
  onDelete,
  onDownload,
  onUpdateExpiry,
}: DocumentListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [category, setCategory] = useState("OTHER");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [editingExpiryId, setEditingExpiryId] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const { user } = useAuth();
  const canMutate = user?.role === "OWNER" || isOwner;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setFeedback(null);
    try {
      await onUpload(file, category);
      setFeedback("تمت إضافة المستند بنجاح.");
    } catch (err) {
      setUploadError(getApiErrorMessage(err).title);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDownload(doc: DocumentResponse) {
    if (downloadingId) return;
    setDownloadingId(doc.id);
    try {
      await onDownload(doc);
    } catch (err) {
      setUploadError(getApiErrorMessage(err).title);
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDelete(id: string) {
    setUploadError(null);
    setFeedback(null);
    try {
      await onDelete(id);
      setFeedback("تم حذف المستند.");
    } catch (err) {
      setUploadError(getApiErrorMessage(err).title);
    }
  }

  async function handleUpdateExpiry(id: string) {
    if (!onUpdateExpiry) return;
    setUploadError(null);
    setFeedback(null);
    try {
      await onUpdateExpiry(id, expiryDate || null);
      setEditingExpiryId(null);
      setFeedback("تم تحديث تاريخ الانتهاء.");
    } catch (err) {
      setUploadError(getApiErrorMessage(err).title);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground">المستندات</h3>
        {canMutate && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary px-3 py-1.5 rounded-lg active:bg-muted/50 transition-colors"
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            إضافة مستند
          </button>
        )}
      </div>

      {canMutate && (
        <div className="flex items-center gap-2 mb-3">
          <label className="text-xs text-muted-foreground">النوع:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-muted rounded-lg px-3 py-1.5 text-sm text-foreground"
          >
            <option value="REGISTRATION">تسجيل</option>
            <option value="INSURANCE">تأمين</option>
            <option value="OTHER">أخرى</option>
          </select>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={handleFileChange}
      />

      {uploadError && <InlineFeedback variant="error" className="mb-3">{uploadError}</InlineFeedback>}
      {feedback && <InlineFeedback variant="success" className="mb-3" onDismiss={() => setFeedback(null)}>{feedback}</InlineFeedback>}
      {downloadingId && <InlineFeedback variant="info" className="mb-3">جاري التحميل...</InlineFeedback>}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="bg-card rounded-2xl border border-border px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            {error ? getApiErrorMessage(error).title : "حدث خطأ في تحميل المستندات"}
          </p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border px-4 py-8 text-center">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">لا توجد مستندات</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-card rounded-xl border border-border shadow-sm p-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">
                  {doc.originalFilename}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {DOCUMENT_CATEGORY_LABELS[doc.category] ?? doc.category} · <span dir="ltr" className="number-ltr">{formatDate(doc.createdAt)}</span>
                </div>
                {onUpdateExpiry && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    تاريخ الانتهاء: {doc.expiryDate ? <span dir="ltr" className="number-ltr">{formatDate(doc.expiryDate)}</span> : "غير محدد"}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDownload(doc)}
                disabled={downloadingId !== null}
                className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground active:scale-95 transition-transform flex-shrink-0"
                aria-label="فتح المستند"
              >
                {downloadingId === doc.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
              </button>
              {canMutate && (
                onUpdateExpiry && editingExpiryId === doc.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      aria-label="تاريخ انتهاء المستند"
                      type="date"
                      className="h-9 rounded-lg border border-border bg-background px-2 text-xs"
                      value={expiryDate}
                      onChange={(event) => setExpiryDate(event.target.value)}
                    />
                    <button type="button" onClick={() => void handleUpdateExpiry(doc.id)} disabled={updating} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-primary">حفظ</button>
                    <button type="button" onClick={() => setEditingExpiryId(null)} disabled={updating} className="rounded-lg px-2 py-1.5 text-xs text-muted-foreground">إلغاء</button>
                  </div>
                ) : (
                  onUpdateExpiry && <button
                    type="button"
                    onClick={() => { setEditingExpiryId(doc.id); setExpiryDate(doc.expiryDate ?? ""); }}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground active:scale-95 transition-transform flex-shrink-0"
                    aria-label="تعديل تاريخ الانتهاء"
                  >
                    <Pencil className="size-4" />
                  </button>
                )
              )}
              {canMutate && (
                <button
                  onClick={() => void handleDelete(doc.id)}
                  disabled={deleting || updating}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-destructive active:scale-95 transition-transform flex-shrink-0"
                  aria-label="حذف المستند"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
