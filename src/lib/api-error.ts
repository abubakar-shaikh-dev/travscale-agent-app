// Axios
import type { AxiosError } from "axios";

/**
 * Shared API error extraction for every feature whose endpoints follow the
 * standard Travscale envelope. Kept in `lib` (with locally-declared envelope
 * types, same precedent as `lib/axios.ts`) so any feature can use it without
 * a cross-feature import.
 */

interface ApiErrorBody {
  success: false;
  message: string;
  error: {
    code: string;
    details: unknown[] | null;
  };
  meta: {
    timestamp: string;
    request_id: string;
    path?: string;
  };
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorInfo {
  code: string | null;
  message: string;
  fieldErrors: ApiFieldError[];
}

/**
 * Convert a thrown value (typically an AxiosError) into a stable shape that
 * forms and toast handlers can render. Never throws.
 */
export function extractApiError(error: unknown): ApiErrorInfo {
  const axiosError = error as AxiosError<ApiErrorBody>;
  const body = axiosError?.response?.data;

  if (body && body.success === false) {
    return {
      code: body.error.code,
      message: body.message,
      fieldErrors: (body.error.details ?? []) as ApiFieldError[],
    };
  }

  if (axiosError?.request && !axiosError.response) {
    return {
      code: null,
      message: "Network error: please check your connection and try again.",
      fieldErrors: [],
    };
  }

  return {
    code: null,
    message:
      (error as Error)?.message ?? "Something went wrong. Please try again.",
    fieldErrors: [],
  };
}

/**
 * Turn a `400 VALIDATION_ERROR` details array into a TanStack Form field-error
 * map by stripping the dot-path prefix (`body.legal_name` -> `legal_name`).
 * Fields the form does not know are ignored, matching only what exists.
 */
export function toFormFieldErrors(
  fieldErrors: ApiFieldError[]
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const detail of fieldErrors) {
    const name = detail.field.split(".").pop() ?? detail.field;
    map[name] = detail.message;
  }
  return map;
}
