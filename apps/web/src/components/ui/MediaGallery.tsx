import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, ImageIcon, Loader2 } from "lucide-react";
import type { PhotoResponse } from "@workspace/api-client-react";
import { useAuth } from "@/providers/AuthProvider";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";

interface MediaGalleryProps {
  photos: PhotoResponse[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isOwner: boolean;
  uploading: boolean;
  deleting: boolean;
  onUpload: (file: File) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onLoadContent: (photo: PhotoResponse) => Promise<string>;
}

export function MediaGallery({
  photos,
  isLoading,
  isError,
  error,
  isOwner,
  uploading,
  deleting,
  onUpload,
  onDelete,
  onLoadContent,
}: MediaGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [contentUrls, setContentUrls] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const canMutate = user?.role === "OWNER" || isOwner;

  useEffect(() => {
    let cancelled = false;
    const urls: Record<string, string> = {};
    const revokeKeys = new Set(Object.keys(contentUrls));

    Promise.all(
      photos.map(async (photo) => {
        try {
          const url = await onLoadContent(photo);
          if (!cancelled) {
            urls[photo.id] = url;
            revokeKeys.delete(photo.id);
          } else {
            URL.revokeObjectURL(url);
          }
        } catch {
          // Leave a placeholder for photos that fail to load.
        }
      }),
    ).then(() => {
      if (cancelled) return;
      revokeKeys.forEach((key) => URL.revokeObjectURL(contentUrls[key]));
      setContentUrls(urls);
    });

    return () => {
      cancelled = true;
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photos]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    try {
      await onUpload(file);
    } catch (err) {
      setUploadError(getApiErrorMessage(err).title);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground">صور السيارة</h3>
        {canMutate && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary px-3 py-1.5 rounded-lg active:bg-muted/50 transition-colors"
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            إضافة صورة
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {uploadError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-2.5 text-sm text-destructive mb-3">
          {uploadError}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="bg-card rounded-2xl border border-border px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            {error ? getApiErrorMessage(error).title : "حدث خطأ في تحميل الصور"}
          </p>
        </div>
      ) : photos.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border px-4 py-8 text-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">لا توجد صور لهذه السيارة</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-muted group">
              {contentUrls[photo.id] ? (
                <img
                  src={contentUrls[photo.id]}
                  alt={photo.caption ?? photo.originalFilename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
                </div>
              )}
              {canMutate && (
                <button
                  onClick={() => onDelete(photo.id)}
                  disabled={deleting}
                  className={cn(
                    "absolute bottom-1.5 left-1.5 p-1.5 rounded-full bg-black/50 text-white active:scale-95 transition-transform",
                  )}
                  aria-label="حذف الصورة"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
