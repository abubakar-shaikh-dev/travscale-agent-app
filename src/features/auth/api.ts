import { axiosInstance } from "@/lib/axios";
import type { LoginCredentials, LoginResponse } from "./types";

export const loginApi = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(
    "/auth/login",
    credentials
  );
  return response.data;
};

export const logoutApi = async (): Promise<void> => {
  await axiosInstance.post("/auth/logout");
};

export const getCurrentUserApi = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};
