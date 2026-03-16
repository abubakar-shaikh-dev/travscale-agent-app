export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  passportNumber?: string;
  passportExpiry?: string;
  nationality: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListResponse {
  data: Customer[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface CustomerResponse {
  data: Customer;
}

export interface CreateCustomerPayload {
  name: string;
  email: string;
  phone: string;
  passportNumber?: string;
  passportExpiry?: string;
  nationality: string;
}

export interface UpdateCustomerPayload extends Partial<CreateCustomerPayload> {
  id: string;
}
