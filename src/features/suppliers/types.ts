// Types
export interface Supplier {
  id: string;
  name: string;
  contactPersonName: string;
  contactPersonPhone: string;
  whatsappNumber: string;
  contactPersonEmail: string;
  website?: string;
  address: string;
  serviceTypes: ServiceType[];
  createdAt: string;
  updatedAt: string;
}

export type ServiceType =
  | "visa"
  | "passport"
  | "hotels"
  | "bus"
  | "flight";

export interface CreateSupplierRequest {
  name: string;
  contactPersonName: string;
  contactPersonPhone: string;
  whatsappNumber: string;
  contactPersonEmail: string;
  website?: string;
  address: string;
  serviceTypes: ServiceType[];
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {
  id: string;
}

export interface SuppliersResponse {
  data: Supplier[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SupplierResponse {
  data: Supplier;
}
