// Query
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// API
import {
  createPassenger,
  deletePassenger,
  getPassenger,
  getPassengers,
  updatePassenger,
} from "./api";

// Types
import type { CreatePassengerPayload, UpdatePassengerPayload } from "./types";

export const passengerKeys = {
  all: ["passengers"] as const,
  lists: () => [...passengerKeys.all, "list"] as const,
  list: (page: number, pageSize: number) =>
    [...passengerKeys.lists(), { page, pageSize }] as const,
  details: () => [...passengerKeys.all, "detail"] as const,
  detail: (id: string) => [...passengerKeys.details(), id] as const,
};

export function usePassengers(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: passengerKeys.list(page, pageSize),
    queryFn: () => getPassengers(page, pageSize),
  });
}

export function usePassenger(id: string) {
  return useQuery({
    queryKey: passengerKeys.detail(id),
    queryFn: () => getPassenger(id),
    enabled: !!id,
  });
}

export function useCreatePassenger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePassengerPayload) => createPassenger(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: passengerKeys.lists() });
    },
  });
}

export function useUpdatePassenger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePassengerPayload;
    }) => updatePassenger(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: passengerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: passengerKeys.detail(id) });
    },
  });
}

export function useDeletePassenger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePassenger(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: passengerKeys.lists() });
    },
  });
}
