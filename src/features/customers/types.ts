export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomersResponse {
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
}

export interface UpdateCustomerPayload {
  name?: string;
  email?: string;
  phone?: string;
}
