import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type GetCustomersParams,
} from "./api";
import type { CreateCustomerPayload, UpdateCustomerPayload } from "./types";

export const CUSTOMERS_KEY = "customers";

export const useCustomers = (params?: GetCustomersParams) => {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, params],
    queryFn: () => getCustomers(params),
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, id],
    queryFn: () => getCustomer(id),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) => createCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCustomerPayload) => updateCustomer(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY, variables.id] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
    },
  });
};
