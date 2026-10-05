// Query
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// API
import {
  createAgency,
  createAgencyLocation,
  getMyAgency,
  listAgencyLocations,
  updateMyAgency,
} from "./api";

// Types
import type {
  CreateAgencyLocationPayload,
  CreateAgencyPayload,
  LocationListQuery,
  UpdateAgencyPayload,
} from "./types";

// Utils
import { extractApiError } from "@/lib/api-error";

// Query keys
export const agencyKeys = {
  all: ["agency"] as const,
  me: () => [...agencyKeys.all, "me"] as const,
  locations: () => [...agencyKeys.all, "locations"] as const,
  locationList: (query: LocationListQuery) =>
    [...agencyKeys.locations(), "list", query] as const,
};

function notifyError(error: unknown): void {
  toast.error(extractApiError(error).message);
}

/** GET /agency/me. 404 is an expected state (no agency yet): gate with `enabled`. */
export function useMyAgency(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: agencyKeys.me(),
    queryFn: getMyAgency,
    enabled: options.enabled ?? true,
    // The agency is edited through dedicated mutations; refetch on invalidation.
    staleTime: 60_000,
  });
}

/** POST /agency, first step of onboarding (docs/api/agency-api.md §5.1). */
export function useCreateAgency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAgencyPayload) => createAgency(payload),
    onSuccess: (agency) => {
      queryClient.setQueryData(agencyKeys.me(), agency);
      toast.success("Agency created");
    },
    onError: notifyError,
  });
}

/** PATCH /agency/me, send only changed fields. */
export function useUpdateAgency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAgencyPayload) => updateMyAgency(payload),
    onSuccess: (agency) => {
      queryClient.setQueryData(agencyKeys.me(), agency);
      toast.success("Agency updated");
    },
    onError: notifyError,
  });
}

/** GET /agency/me/locations (no nested agency on items). */
export function useAgencyLocations(query: LocationListQuery = {}) {
  return useQuery({
    queryKey: agencyKeys.locationList(query),
    queryFn: () => listAgencyLocations(query),
    staleTime: 60_000,
  });
}

/** POST /agency/me/locations (docs/api/agency-api.md §6.1). */
export function useCreateAgencyLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAgencyLocationPayload) =>
      createAgencyLocation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agencyKeys.locations() });
      toast.success("Location added");
    },
    onError: notifyError,
  });
}
