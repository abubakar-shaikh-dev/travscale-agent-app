// Query
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// API
import {
  confirmUpload,
  createUploadUrl,
  deleteStorageFile,
  getSignedUrl,
  uploadToBucket,
} from "./api";

// Types
import type {
  CompletedUpload,
  CreateUploadUrlPayload,
  SignedUrlQuery,
} from "./types";

// Utils
import { extractApiError } from "@/lib/api-error";

// Query keys
export const storageKeys = {
  all: ["storage"] as const,
  signedUrl: (query: SignedUrlQuery) =>
    [...storageKeys.all, "signed-url", query] as const,
};

/**
 * The whole upload flow of docs/api/storage-api.md §3.2 as ONE mutation:
 * presign -> raw PUT to the bucket -> confirm. Resolves with the confirmed
 * key so the caller can persist it on the owning record.
 *
 * `onProgress` reports PUT bytes (0..1) so callers can show determinate
 * progress; presign and confirm are too fast to be worth reporting.
 *
 * Errors are NOT toasted here: upload failures are shown inline by the
 * caller, next to the affordance that started them.
 *
 * A 409 STORAGE_UPLOAD_ALREADY_CONFIRMED on confirm is treated as success:
 * the object is already usable (docs/api/storage-api.md §3.2.3).
 */
export function useUploadFile() {
  return useMutation({
    mutationFn: async ({
      file,
      meta,
      onProgress,
    }: {
      file: File;
      meta: CreateUploadUrlPayload;
      onProgress?: (fraction: number) => void;
    }): Promise<CompletedUpload> => {
      const contentType = meta.content_type;
      const presigned = await createUploadUrl({
        ...meta,
        content_type: contentType,
        expected_size: meta.expected_size ?? file.size,
      });

      await uploadToBucket(presigned.upload_url, file, contentType, onProgress);

      try {
        const confirmed = await confirmUpload(presigned.upload_id);
        return { upload_id: confirmed.upload_id, key: confirmed.key, size: confirmed.size };
      } catch (error) {
        const info = extractApiError(error);
        if (info.code === "STORAGE_UPLOAD_ALREADY_CONFIRMED") {
          return { upload_id: presigned.upload_id, key: presigned.key, size: file.size };
        }
        throw error;
      }
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => deleteStorageFile(key),
    onSuccess: (_data, key) => {
      // Drop the cached signed url: the object is gone, and a still-cached
      // url would keep rendering the deleted file until it expired.
      queryClient.removeQueries({ queryKey: storageKeys.signedUrl({ key }) });
    },
    onError: (error) => {
      toast.error(extractApiError(error).message);
    },
  });
}

/**
 * GET /storage/url for rendering a stored object. Signed read urls expire
 * (server default 300s): keep data fresh strictly under that and refetch on
 * window focus so a long-lived screen never shows a dead url.
 */
export function useSignedUrl(
  query: SignedUrlQuery,
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: storageKeys.signedUrl(query),
    queryFn: () => getSignedUrl(query),
    enabled: (options.enabled ?? true) && !!query.key,
    staleTime: 4 * 60 * 1000,
    // A 404 STORAGE_UPLOAD_NOT_FOUND means logo_key is stale (the object was
    // deleted server-side); callers fall back to a placeholder on failure.
    retry: false,
    refetchOnWindowFocus: true,
  });
}
