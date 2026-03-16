import { axiosInstance } from "@/lib/axios";
import type {
  CustomerListResponse,
  CustomerResponse,
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from "./types";

export interface GetCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const getCustomers = async (
  params?: GetCustomersParams
): Promise<CustomerListResponse> => {
  const response = await axiosInstance.get<CustomerListResponse>("/customers", {
    params,
  });
  return response.data;
};

export const getCustomer = async (
  id: string
): Promise<CustomerResponse> => {
  const response = await axiosInstance.get<CustomerResponse>(
    `/customers/${id}`
  );
  return response.data;
};

export const createCustomer = async (
  payload: CreateCustomerPayload
): Promise<CustomerResponse> => {
  const response = await axiosInstance.post<CustomerResponse>(
    "/customers",
    payload
  );
  return response.data;
};

export const updateCustomer = async (
  payload: UpdateCustomerPayload
): Promise<CustomerResponse> => {
  const { id, ...data } = payload;
  const response = await axiosInstance.put<CustomerResponse>(
    `/customers/${id}`,
    data
  );
  return response.data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/customers/${id}`);
};
