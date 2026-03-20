// React
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// API
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "./api";

// Types
// import type { CreateSupplierRequest, UpdateSupplierRequest } from "./types";

/**
 * Fetch all suppliers
 */
export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });
}

/**
 * Fetch a single supplier by ID
 */
export function useSupplier(id: string) {
  return useQuery({
    queryKey: ["suppliers", id],
    queryFn: () => getSupplier(id),
    enabled: !!id,
  });
}

/**
 * Create a new supplier
 */
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

/**
 * Update an existing supplier
 */
export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSupplier,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers", data.id] });
    },
  });
}

/**
 * Delete a supplier
 */
export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}