export interface Passenger {
  id: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth: string;
  nationality: string;
  phone: string;
  email: string;
  passportNumber: string;
  passportExpiry: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePassengerPayload {
  firstName: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth: string;
  nationality: string;
  phone: string;
  email: string;
  passportNumber: string;
  passportExpiry: string;
  notes?: string;
}

export interface UpdatePassengerPayload {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  phone?: string;
  email?: string;
  passportNumber?: string;
  passportExpiry?: string;
  notes?: string;
}

export interface PassengerResponse {
  data: Passenger;
}

export interface PassengersResponse {
  data: Passenger[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
