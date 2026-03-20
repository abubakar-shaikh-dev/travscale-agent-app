// Lib
import { axiosInstance } from "@/lib/axios";

// Types
import type {
  CreateCustomerPayload,
  CustomerResponse,
  CustomersResponse,
  UpdateCustomerPayload,
} from "./types";

export async function getCustomers(
  page = 1,
  pageSize = 10
): Promise<CustomersResponse> {
  const response = await axiosInstance.get<CustomersResponse>("/customers", {
    params: { page, pageSize },
  });
  return response.data;
}

export async function getCustomer(id: string): Promise<CustomerResponse> {
  const response = await axiosInstance.get<CustomerResponse>(
    `/customers/${id}`
  );
  return response.data;
}

export async function createCustomer(
  payload: CreateCustomerPayload
): Promise<CustomerResponse> {
  const response = await axiosInstance.post<CustomerResponse>(
    "/customers",
    payload
  );
  return response.data;
}

export async function updateCustomer(
  id: string,
  payload: UpdateCustomerPayload
): Promise<CustomerResponse> {
  const response = await axiosInstance.patch<CustomerResponse>(
    `/customers/${id}`,
    payload
  );
  return response.data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await axiosInstance.delete(`/customers/${id}`);
}
