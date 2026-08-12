import { useRef, useState } from "react";
import { Plus, FileText, Trash2, Download, Loader2 } from "lucide-react";
import type { DocumentResponse } from "@workspace/api-client-react";
import { useAuth } from "@/providers/AuthProvider";
import { getApiErrorMessage } from "@/lib/api-error";
import { DOCUMENT_CATEGORY_LABELS, formatFileSize, formatDate } from "@/lib/media-labels";

interface DocumentListProps {
  documents: DocumentResponse[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isOwner: boolean;
  uploading: boolean;
  deleting: boolean;
  onUpload: (file: File, category: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDownload: (doc: DocumentResponse) => Promise<void>;
}

export function DocumentList({
  documents,
  isLoading,
  isError,
  error,
  isOwner,
  uploading,
  deleting,
  onUpload,
  onDelete,
  onDownload,
}: DocumentListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [category, setCategory] = useState("OTHER");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { user } = useAuth();
  const canMutate = user?.role === "OWNER" || isOwner;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    try {
      await onUpload(file, category);
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

      {(uploadError || downloadingId) && (
        <div
          className={
            uploadError
              ? "bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-2.5 text-sm text-destructive mb-3"
              : "bg-muted rounded-xl px-4 py-2.5 text-sm text-muted-foreground mb-3"
          }
        >
          {uploadError ? uploadError : "جاري التحميل..."}
        </div>
      )}

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
                  {DOCUMENT_CATEGORY_LABELS[doc.category] ?? doc.category} · {formatFileSize(doc.fileSize)} · {formatDate(doc.createdAt)}
                </div>
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
                <button
                  onClick={() => onDelete(doc.id)}
                  disabled={deleting}
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
