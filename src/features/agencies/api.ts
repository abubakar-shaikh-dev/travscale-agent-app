// Axios
import { axiosInstance } from "@/lib/axios";

// Types
import type { AxiosResponse } from "axios";
import type {
  Agency,
  AgencyLocation,
  CreateAgencyLocationPayload,
  CreateAgencyPayload,
  LocationListQuery,
  Paginated,
  UpdateAgencyPayload,
} from "./types";

/** Unwrap the success envelope, returning the inner data. */
function unwrap<T>(response: AxiosResponse<{ data: T }>): T {
  return response.data.data;
}

// --- Agency (docs/api/agency-api.md §5) ---------------------------------------

/** POST /agency — 201, first step of onboarding. */
export async function createAgency(
  payload: CreateAgencyPayload
): Promise<Agency> {
  return unwrap(await axiosInstance.post("/agency", payload));
}

/** GET /agency/me — 404 AGENCY_NOT_FOUND until the user creates one. */
export async function getMyAgency(): Promise<Agency> {
  return unwrap(await axiosInstance.get("/agency/me"));
}

/** PATCH /agency/me — partial update, at least one field. */
export async function updateMyAgency(
  payload: UpdateAgencyPayload
): Promise<Agency> {
  return unwrap(await axiosInstance.patch("/agency/me", payload));
}

// --- Locations (docs/api/agency-api.md §6) ------------------------------------

/** GET /agency/me/locations — items do NOT carry the nested agency object. */
export async function listAgencyLocations(
  query: LocationListQuery = {}
): Promise<Paginated<AgencyLocation>> {
  return unwrap(
    await axiosInstance.get("/agency/me/locations", { params: query })
  );
}

/** POST /agency/me/locations — 201. */
export async function createAgencyLocation(
  payload: CreateAgencyLocationPayload
): Promise<AgencyLocation> {
  return unwrap(await axiosInstance.post("/agency/me/locations", payload));
}

/** GET /agency/me/locations/:id — includes the nested agency object. */
export async function getAgencyLocation(id: string): Promise<AgencyLocation> {
  return unwrap(await axiosInstance.get(`/agency/me/locations/${id}`));
}
