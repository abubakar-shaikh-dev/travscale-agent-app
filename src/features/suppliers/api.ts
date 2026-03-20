// Router
import { axiosInstance } from "@/lib/axios";

// Types
import type {
  CreateSupplierRequest,
  UpdateSupplierRequest,
  Supplier,
  SuppliersResponse,
  SupplierResponse,
} from "./types";

/**
 * Fetch all suppliers
 */
export async function getSuppliers(): Promise<Supplier[]> {
  const response = await axiosInstance.get<SuppliersResponse>("/suppliers");
  return response.data.data;
}

/**
 * Fetch a single supplier by ID
 */
export async function getSupplier(id: string): Promise<Supplier> {
  const response = await axiosInstance.get<SupplierResponse>(`/suppliers/${id}`);
  return response.data.data;
}

/**
 * Create a new supplier
 */
export async function createSupplier(supplier: CreateSupplierRequest): Promise<Supplier> {
  const response = await axiosInstance.post<SupplierResponse>("/suppliers", supplier);
  return response.data.data;
}

/**
 * Update an existing supplier
 */
export async function updateSupplier(supplier: UpdateSupplierRequest): Promise<Supplier> {
  const { id, ...updateData } = supplier;
  const response = await axiosInstance.put<SupplierResponse>(`/suppliers/${id}`, updateData);
  return response.data.data;
}

/**
 * Delete a supplier
 */
export async function deleteSupplier(id: string): Promise<void> {
  await axiosInstance.delete(`/suppliers/${id}`);
}