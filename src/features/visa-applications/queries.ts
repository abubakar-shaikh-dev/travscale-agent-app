// Query
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// API
import {
  createVisaApplication,
  getVisaApplication,
  getVisaApplications,
  updateVisaApplicationStatus,
} from "./api";

// Types
import type {
  CreateVisaApplicationPayload,
  UpdateVisaStatusPayload,
} from "./types";

export const visaApplicationKeys = {
  all: ["visa-applications"] as const,
  lists: () => [...visaApplicationKeys.all, "list"] as const,
  list: (page: number, pageSize: number) =>
    [...visaApplicationKeys.lists(), { page, pageSize }] as const,
  details: () => [...visaApplicationKeys.all, "detail"] as const,
  detail: (id: string) => [...visaApplicationKeys.details(), id] as const,
};

export function useVisaApplications(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: visaApplicationKeys.list(page, pageSize),
    queryFn: () => getVisaApplications(page, pageSize),
  });
}

export function useVisaApplication(id: string) {
  return useQuery({
    queryKey: visaApplicationKeys.detail(id),
    queryFn: () => getVisaApplication(id),
    enabled: !!id,
  });
}

export function useCreateVisaApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVisaApplicationPayload) =>
      createVisaApplication(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: visaApplicationKeys.lists(),
      });
    },
  });
}

export function useUpdateVisaApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateVisaStatusPayload;
    }) => updateVisaApplicationStatus(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: visaApplicationKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: visaApplicationKeys.detail(id),
      });
    },
  });
}
