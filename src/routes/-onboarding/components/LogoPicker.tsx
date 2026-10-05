// React
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

// Query
import { useQueryClient } from "@tanstack/react-query";

// Icons
import { ImagePlusIcon, TriangleAlertIcon } from "lucide-react";

// Feature API
import { updateMyAgency } from "@/features/agencies/api";
import { deleteStorageFile } from "@/features/storage/api";

// Feature Queries
import { agencyKeys } from "@/features/agencies/queries";
import { useDeleteFile, useSignedUrl, useUploadFile } from "@/features/storage/queries";

// Types
import type { Agency } from "@/features/agencies/types";

// Utils
import { extractApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";

// The storage API's own ceiling for agency_logo (docs/api/storage-api.md §3.1).
const MAX_LOGO_BYTES = 2_097_152;
const ALLOWED_LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

// Oversized logos are shrunk to this edge before re-encoding; far more
// resolution than a mark that renders at 64px here and small print on quotes.
const SHRINK_TARGET_EDGE = 1024;

const TYPE_REJECTED_MESSAGE = "Logos must be a PNG, JPG or WebP image.";
const STILL_TOO_LARGE_MESSAGE =
  "That image is still over 2 MB after shrinking. Please pick a smaller file.";

// Progress ring geometry: drawn in the padding just outside the 64px tile.
const RING_VIEWBOX = 72;
const RING_RADIUS = 34;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** A rejection the user can act on (bad type, unshrinkable size). */
class LogoFileError extends Error {}

/**
 * Fit any reasonable image under the 2 MB ceiling client-side: oversized
 * files are downscaled and re-encoded (alpha preserved for PNG/WebP) instead
 * of bounced back with an error the user can do nothing about.
 */
async function prepareLogoFile(file: File): Promise<File> {
  if (!ALLOWED_LOGO_TYPES.has(file.type)) {
    throw new LogoFileError(TYPE_REJECTED_MESSAGE);
  }
  if (file.size <= MAX_LOGO_BYTES) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, SHRINK_TARGET_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new LogoFileError(STILL_TOO_LARGE_MESSAGE);
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // Same format first (JPEG never carries alpha, so it has none to lose);
  // WebP, which is alpha-capable and denser, covers PNGs that won't compress.
  const formats = file.type === "image/png" ? ["image/png", "image/webp"] : [file.type];
  for (const type of formats) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, type, type === "image/png" ? undefined : 0.9)
    );
    if (blob && blob.size <= MAX_LOGO_BYTES) {
      const extension = type === "image/jpeg" ? "jpg" : type.slice("image/".length);
      const base = file.name.replace(/\.[^.]+$/, "") || "logo";
      return new File([blob], `${base}.${extension}`, { type });
    }
  }
  throw new LogoFileError(STILL_TOO_LARGE_MESSAGE);
}

interface LogoPickerProps {
  agency: Agency;
}

/**
 * Agency logo, living as the identity slot of the finish-screen summary
 * card. The full storage flow (presign -> bucket PUT -> confirm ->
 * PATCH /agency/me) with an optimistic local preview, byte-level progress,
 * drag & drop anywhere on the page, clipboard paste, and client-side
 * shrinking under the server's size ceiling. Removing deletes the object
 * (logo_key itself cannot be unset server-side); a stale key falls back to
 * the initials tile instead of a broken image.
 */
export function LogoPicker({ agency }: LogoPickerProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadFile();
  const removeLogo = useDeleteFile();

  const hasLogo = !!agency.logo_key;
  const signed = useSignedUrl({ key: agency.logo_key ?? "" }, { enabled: hasLogo });

  // The just-picked file, shown optimistically until the signed url for the
  // newly uploaded key arrives (same pixels), so the tile never flashes.
  const [pending, setPending] = useState<{ url: string; key: string } | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<{ message: string; seq: number } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const dragDepth = useRef(0);
  const errorSeq = useRef(0);

  const busy = upload.isPending || saving || removeLogo.isPending;

  const previewSrc = pending?.url ?? (hasLogo && signed.isSuccess ? signed.data.url : undefined);
  const showImage = !!previewSrc;

  const initials = agency.display_name
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const reportError = (message: string) => {
    errorSeq.current += 1;
    setError({ message, seq: errorSeq.current });
  };

  const handleFile = async (file: File | undefined) => {
    if (!file || busy) return;
    setError(null);

    let prepared: File;
    try {
      prepared = await prepareLogoFile(file);
    } catch (thrown) {
      reportError(
        thrown instanceof LogoFileError
          ? thrown.message
          : "We couldn't read that image. Please try a different file."
      );
      return;
    }

    const previousKey = agency.logo_key;
    const previewUrl = URL.createObjectURL(prepared);
    // Optimistic: the tile shows the picked file immediately, while the
    // empty key keeps the render-time reset below from firing early.
    setPending({ url: previewUrl, key: "" });
    setProgress(0);
    try {
      const completed = await upload.mutateAsync({
        file: prepared,
        meta: {
          filename: prepared.name,
          content_type: prepared.type,
          purpose: "agency_logo",
          expected_size: prepared.size,
        },
        onProgress: setProgress,
      });
      setPending({ url: previewUrl, key: completed.key });
      setProgress(null);

      setSaving(true);
      await updateMyAgency({ logo_key: completed.key });
      queryClient.invalidateQueries({ queryKey: agencyKeys.me() });

      // Best-effort orphan cleanup: once logo_key moves on, the replaced
      // object is unreachable and storage has no garbage collection.
      if (previousKey && previousKey !== completed.key) {
        void deleteStorageFile(previousKey).catch((cleanupError) => {
          console.warn(`Failed to delete replaced logo object ${previousKey}:`, cleanupError);
        });
      }
    } catch (thrown) {
      setPending((current) => (current?.url === previewUrl ? null : current));
      reportError(extractApiError(thrown).message);
    } finally {
      setProgress(null);
      setSaving(false);
    }
  };

  // Ref mirror so the always-on window listeners below call the latest
  // handler (and see the latest busy state) without resubscribing.
  const handleFileRef = useRef(handleFile);
  useEffect(() => {
    handleFileRef.current = handleFile;
  });

  const handleRemove = () => {
    if (!agency.logo_key || busy) return;
    setError(null);
    removeLogo.mutate(agency.logo_key);
  };

  // Render-time reset (the same pattern the wizard's step tracking uses):
  // once the signed url for the uploaded key is what the tile renders, the
  // local preview has no job left.
  if (pending && !busy && signed.isSuccess && signed.data && signed.data.key === pending.key) {
    setPending(null);
  }

  // The preview url's lifecycle is owned by this cleanup: revoked when a
  // different preview takes over, when the preview is dropped, or on
  // unmount. Keyed by url so promoting the same preview's key in place
  // (upload finished) does not revoke a url the tile is still showing.
  const pendingUrl = pending?.url ?? null;
  useEffect(() => {
    if (!pendingUrl) return;
    return () => URL.revokeObjectURL(pendingUrl);
  }, [pendingUrl]);

  // Page-wide drag & drop: a file dragged anywhere on the finish screen gets
  // caught (with a full-page veil) instead of triggering the browser's
  // default of navigating away to display the dropped image.
  useEffect(() => {
    const hasFiles = (event: DragEvent) => !!event.dataTransfer?.types.includes("Files");
    const onDragEnter = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      dragDepth.current += 1;
      setDragActive(true);
    };
    const onDragLeave = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragActive(false);
    };
    const onDragOver = (event: DragEvent) => {
      if (hasFiles(event)) event.preventDefault();
    };
    const onDrop = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      dragDepth.current = 0;
      setDragActive(false);
      void handleFileRef.current(event.dataTransfer?.files[0]);
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  // Pasted images (screenshot of a logo straight from the clipboard) follow
  // the same path as picked files. Text pastes are untouched.
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const file = event.clipboardData?.files[0];
      if (!file) return;
      event.preventDefault();
      void handleFileRef.current(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {/* Tile: preview, initials fallback, or the upload affordance itself.
            The ring wrapper reserves padding for the progress circle. */}
        <div className="relative shrink-0 p-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            aria-label={hasLogo ? "Replace logo" : "Upload logo"}
            className={cn(
              "group relative flex size-16 cursor-pointer items-center justify-center overflow-hidden rounded-xl border transition-transform duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-ring motion-safe:active:scale-[0.97] disabled:cursor-default disabled:motion-safe:active:scale-100",
              showImage
                ? "border-input bg-background"
                : hasLogo
                  ? "border-input bg-muted"
                  : "border-dashed border-input bg-background/50 hover:border-ring/60 hover:bg-background",
              upload.isPending && "opacity-90"
            )}
          >
            {showImage ? (
              <img
                src={previewSrc}
                alt={`${agency.display_name} logo`}
                decoding="async"
                className={cn("fade-in size-full object-contain", upload.isPending && "opacity-80")}
              />
            ) : hasLogo ? (
              <span className="font-heading text-lg font-semibold text-foreground">
                {initials || "?"}
              </span>
            ) : (
              <ImagePlusIcon className="size-5 text-muted-foreground" aria-hidden="true" />
            )}
            {showImage && !busy && (
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/72 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100">
                <ImagePlusIcon className="size-4" aria-hidden="true" />
                <span className="text-[10px] font-medium">Replace</span>
              </span>
            )}
          </button>
          {progress !== null && (
            <svg
              viewBox={`0 0 ${RING_VIEWBOX} ${RING_VIEWBOX}`}
              className="pointer-events-none absolute inset-0 size-full"
              aria-hidden="true"
            >
              <circle
                cx={RING_VIEWBOX / 2}
                cy={RING_VIEWBOX / 2}
                r={RING_RADIUS}
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                className="stroke-primary [transition:stroke-dashoffset_150ms_linear]"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
                transform={`rotate(-90 ${RING_VIEWBOX / 2} ${RING_VIEWBOX / 2})`}
              />
            </svg>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate font-heading text-base font-semibold leading-tight">
            {agency.display_name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{agency.legal_name}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-xs">
            {upload.isPending ? (
              <span className="tabular-nums text-muted-foreground">
                {progress !== null && progress < 1
                  ? `Uploading ${Math.round(progress * 100)}%`
                  : "Finishing..."}
              </span>
            ) : saving ? (
              <span className="text-muted-foreground">Saving logo...</span>
            ) : hasLogo ? (
              <>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={busy}
                  className="cursor-pointer rounded-sm font-medium text-foreground underline-offset-2 transition-colors outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-64"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={busy}
                  className="cursor-pointer rounded-sm font-medium text-muted-foreground underline-offset-2 transition-colors outline-none hover:text-destructive hover:underline focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-64"
                >
                  Remove
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="cursor-pointer rounded-sm font-medium text-primary underline-offset-2 transition-colors outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                Add logo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Where the logo ends up: the reassurance that makes an optional
          upload feel worth ten seconds, before and after uploading. */}
      <p className="text-xs text-muted-foreground">
        {hasLogo
          ? "Appears on quotes, invoices and documents."
          : "PNG, JPG or WebP, up to 2 MB. Appears on quotes, invoices and documents."}
      </p>

      {error && (
        <p
          key={error.seq}
          role="alert"
          className="error-shake flex items-start gap-1.5 text-xs text-destructive"
        >
          <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {error.message}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {dragActive &&
        !busy &&
        createPortal(
          <div className="fade-in pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/72 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-ring/70 bg-card px-12 py-10 text-center shadow-sm">
              <ImagePlusIcon className="size-8 text-muted-foreground" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Drop to set your logo</p>
                <p className="text-xs text-muted-foreground">PNG, JPG or WebP, up to 2 MB</p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
