// Shared domain types: matches the Travscale Storage API reference
// (docs/api/storage-api.md).

/**
 * docs/api/storage-api.md §3.1 purposes. `entity_id` is required for every
 * purpose except `agency_logo`.
 */
export type StoragePurpose =
  | "agency_logo"
  | "customer_document"
  | "supplier_document"
  | "itinerary_attachment"
  | "invoice_pdf";

export interface CreateUploadUrlPayload {
  filename: string;
  content_type: string;
  purpose: StoragePurpose;
  entity_id?: string;
  expected_size?: number;
}

/** POST /storage/upload-url response data. */
export interface UploadUrlData {
  upload_id: string;
  /** Object key to store on the owning record. Not a URL. */
  key: string;
  /** Single-use presigned PUT url for the bucket itself. */
  upload_url: string;
  expires_in: number;
}

/** POST /storage/confirm response data. */
export interface ConfirmUploadData {
  upload_id: string;
  key: string;
  content_type: string;
  /** Byte count read back from the bucket, not what was declared. */
  size: number;
  confirmed_at: string;
}

/** GET /storage/url response data. */
export interface SignedUrlData {
  upload_id: string;
  key: string;
  url: string;
  expires_in: number;
}

export interface SignedUrlQuery {
  key: string;
  disposition?: "inline" | "attachment";
}

/**
 * The result of the full upload orchestration (upload-url -> PUT -> confirm):
 * everything a caller needs to persist the key and show a preview.
 */
export interface CompletedUpload {
  upload_id: string;
  key: string;
  size: number;
}
