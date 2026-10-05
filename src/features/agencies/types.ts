// Shared domain types: matches the Travscale Agency API reference
// (docs/api/agency-api.md).

/** docs/api/agency-api.md §4 — Agency. */
export interface Agency {
  id: string;
  owner_id: string;
  legal_name: string;
  display_name: string;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  logo_key: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * docs/api/agency-api.md §4 — AgencyLocation. `agency` is only nested by
 * GET /agency/me/locations/:id, so it is optional here by design.
 */
export interface AgencyLocation {
  id: string;
  agency_id: string;
  name: string;
  code: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state_code: string | null;
  postal_code: string | null;
  country_code: string;
  currency: string;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  agency?: { id: string; display_name: string };
}

/** Standard list envelope shared by every paginated endpoint. */
export interface Paginated<TItem> {
  items: TItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// ---------------------------------------------------------------------------
// Request payloads
// ---------------------------------------------------------------------------

/** POST /agency body (docs/api/agency-api.md §5.1). */
export interface CreateAgencyPayload {
  legal_name: string;
  display_name: string;
  email: string;
  phone: string;
  website_url?: string;
  logo_key?: string;
}

/** PATCH /agency/me body: at least one field, send only what changed. */
export interface UpdateAgencyPayload {
  legal_name?: string;
  display_name?: string;
  email?: string;
  phone?: string;
  website_url?: string;
  logo_key?: string;
}

/** GET /agency/me/locations query (docs/api/agency-api.md §6.2). */
export interface LocationListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: "created_at" | "name" | "code" | "city";
  sort_order?: "asc" | "desc";
}

/** POST /agency/me/locations body (docs/api/agency-api.md §6.1). */
export interface CreateAgencyLocationPayload {
  name: string;
  code: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_code?: string;
  postal_code?: string;
  country_code: string;
  currency?: string;
}

/** Error codes used by the agency module (docs/api/agency-api.md §5.4, §6.6). */
export type AgencyErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "AGENCY_NOT_FOUND"
  | "AGENCY_ALREADY_EXISTS"
  | "AGENCY_LOCATION_NOT_FOUND"
  | "AGENCY_LOCATION_CODE_EXISTS";
