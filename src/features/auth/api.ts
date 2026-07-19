// Lib
import { axiosInstance } from "@/lib/axios";

// Types
import type {
  ApiError,
  ApiFieldError,
  ApiSuccess,
  AuthSession,
  ForgotPasswordPayload,
  LoginPayload,
  LogoutPayload,
  RefreshSession,
  RefreshTokenPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
} from "./types";
import type { AxiosError } from "axios";

/** Unwrap a success envelope, asserting success and returning the inner data. */
function unwrap<T>(response: { data: ApiSuccess<T> }): T {
  return response.data.data;
}

export async function registerApi(
  payload: RegisterPayload
): Promise<AuthSession> {
  const response = await axiosInstance.post<ApiSuccess<AuthSession>>(
    "/auth/register",
    payload
  );
  return unwrap(response);
}

export async function loginApi(payload: LoginPayload): Promise<AuthSession> {
  const response = await axiosInstance.post<ApiSuccess<AuthSession>>(
    "/auth/login",
    payload
  );
  return unwrap(response);
}

export async function refreshTokenApi(
  payload: RefreshTokenPayload
): Promise<RefreshSession> {
  const response = await axiosInstance.post<ApiSuccess<RefreshSession>>(
    "/auth/refresh-token",
    payload
  );
  return unwrap(response);
}

export async function logoutApi(payload: LogoutPayload): Promise<string> {
  const response = await axiosInstance.post<ApiSuccess<null>>(
    "/auth/logout",
    payload
  );
  return response.data.message;
}

export async function verifyEmailApi(
  payload: VerifyEmailPayload
): Promise<string> {
  const response = await axiosInstance.post<ApiSuccess<null>>(
    "/auth/verify-email",
    payload
  );
  return response.data.message;
}

export async function resendVerificationApi(): Promise<string> {
  const response = await axiosInstance.post<ApiSuccess<null>>(
    "/auth/resend-verification-link"
  );
  return response.data.message;
}

export async function forgotPasswordApi(
  payload: ForgotPasswordPayload
): Promise<string> {
  const response = await axiosInstance.post<ApiSuccess<null>>(
    "/auth/forgot-password",
    payload
  );
  return response.data.message;
}

export async function resetPasswordApi(
  payload: ResetPasswordPayload
): Promise<string> {
  const response = await axiosInstance.post<ApiSuccess<null>>(
    "/auth/reset-password",
    payload
  );
  return response.data.message;
}

// --- Error extraction helper (shared by forms + queries) --------------------

export interface AuthErrorInfo {
  code: string | null;
  message: string;
  fieldErrors: ApiFieldError[];
}

/**
 * Convert a thrown value (typically an AxiosError) into a stable shape that
 * forms and toast handlers can render. Never throws.
 */
export function extractAuthError(error: unknown): AuthErrorInfo {
  const axiosError = error as AxiosError<ApiError>;
  const body = axiosError?.response?.data;

  if (body && body.success === false) {
    return {
      code: body.error.code,
      message: body.message,
      fieldErrors: body.error.details ?? [],
    };
  }

  if (axiosError?.request && !axiosError.response) {
    return {
      code: null,
      message: "Network error — please check your connection and try again.",
      fieldErrors: [],
    };
  }

  return {
    code: null,
    message:
      (error as Error)?.message ??
      "Something went wrong. Please try again.",
    fieldErrors: [],
  };
}
