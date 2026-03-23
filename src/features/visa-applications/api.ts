// Lib
import { axiosInstance } from "@/lib/axios";

// Types
import type {
  CreateVisaApplicationPayload,
  UpdateVisaStatusPayload,
  VisaApplicationResponse,
  VisaApplicationsResponse,
} from "./types";

export async function getVisaApplications(
  page = 1,
  pageSize = 10,
): Promise<VisaApplicationsResponse> {
  const response = await axiosInstance.get<VisaApplicationsResponse>(
    "/visa-applications",
    { params: { page, pageSize } },
  );

  return response.data;
}

export async function getVisaApplication(
  id: string,
): Promise<VisaApplicationResponse> {
  const response = await axiosInstance.get<VisaApplicationResponse>(
    `/visa-applications/${id}`,
  );

  return response.data;
}

export async function createVisaApplication(
  payload: CreateVisaApplicationPayload,
): Promise<VisaApplicationResponse> {
  const response = await axiosInstance.post<VisaApplicationResponse>(
    "/visa-applications",
    payload,
  );

  return response.data;
}

export async function updateVisaApplicationStatus(
  id: string,
  payload: UpdateVisaStatusPayload,
): Promise<VisaApplicationResponse> {
  const response = await axiosInstance.patch<VisaApplicationResponse>(
    `/visa-applications/${id}/status`,
    payload,
  );

  return response.data;
}
