// Lib
import { axiosInstance } from "@/lib/axios";

// Types
import type {
  CreatePassengerPayload,
  PassengerResponse,
  PassengersResponse,
  UpdatePassengerPayload,
} from "./types";

export async function getPassengers(
  page = 1,
  pageSize = 10,
): Promise<PassengersResponse> {
  const response = await axiosInstance.get<PassengersResponse>("/passengers", {
    params: { page, pageSize },
  });

  return response.data;
}

export async function getPassenger(id: string): Promise<PassengerResponse> {
  const response = await axiosInstance.get<PassengerResponse>(
    `/passengers/${id}`,
  );

  return response.data;
}

export async function createPassenger(
  payload: CreatePassengerPayload,
): Promise<PassengerResponse> {
  const response = await axiosInstance.post<PassengerResponse>(
    "/passengers",
    payload,
  );

  return response.data;
}

export async function updatePassenger(
  id: string,
  payload: UpdatePassengerPayload,
): Promise<PassengerResponse> {
  const response = await axiosInstance.patch<PassengerResponse>(
    `/passengers/${id}`,
    payload,
  );

  return response.data;
}

export async function deletePassenger(id: string): Promise<void> {
  await axiosInstance.delete(`/passengers/${id}`);
}
