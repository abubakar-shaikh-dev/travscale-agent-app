// Axios
import { axiosInstance } from "@/lib/axios";

// Types
import type {
  ConfirmUploadData,
  CreateUploadUrlPayload,
  SignedUrlData,
  SignedUrlQuery,
  UploadUrlData,
} from "./types";

/** Unwrap the success envelope, returning the inner data. */
function unwrap<T>(response: { data: { data: T } }): T {
  return response.data.data;
}

/**
 * POST /storage/upload-url (docs/api/storage-api.md §3.2.1). Signs a url only;
 * no bytes are sent and no object exists yet.
 */
export async function createUploadUrl(
  payload: CreateUploadUrlPayload
): Promise<UploadUrlData> {
  return unwrap(await axiosInstance.post("/storage/upload-url", payload));
}

/**
 * PUT the raw bytes straight to the bucket (docs/api/storage-api.md §3.2.2).
 *
 * Deliberately NOT the axios instance: the signed url is the credential, so
 * no Authorization header and no cookies may be attached, and the Content-Type
 * must match the presign request byte for byte. Success is any 2xx.
 *
 * XHR instead of fetch so callers get byte-level upload progress.
 */
export function uploadToBucket(
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress?: (fraction: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      reject(
        new Error(
          `Bucket upload failed with status ${xhr.status}. The url may have expired or the headers did not match.`
        )
      );
    };
    xhr.onerror = () => {
      reject(new Error("Bucket upload failed. Check your connection and try again."));
    };
    xhr.send(file);
  });
}

/**
 * POST /storage/confirm (docs/api/storage-api.md §3.2.3). The backend reads
 * the object back, verifies type + size, and marks the upload usable.
 * A 409 STORAGE_UPLOAD_ALREADY_CONFIRMED means it is already usable: callers
 * may treat that error code as success.
 */
export async function confirmUpload(uploadId: string): Promise<ConfirmUploadData> {
  return unwrap(await axiosInstance.post("/storage/confirm", { upload_id: uploadId }));
}

/**
 * GET /storage/url, a short-lived signed read url for a CONFIRMED upload
 * (docs/api/storage-api.md §3.3). Never persist the url; re-request when
 * `expires_in` has passed.
 */
export async function getSignedUrl(query: SignedUrlQuery): Promise<SignedUrlData> {
  return unwrap(
    await axiosInstance.get("/storage/url", {
      params: { key: query.key, disposition: query.disposition ?? "inline" },
    })
  );
}

/**
 * DELETE /storage?key=... (docs/api/storage-api.md §3.4). The key is a query
 * parameter, not a path segment. There is no restore.
 */
export async function deleteStorageFile(key: string): Promise<void> {
  await axiosInstance.delete("/storage", { params: { key } });
}
