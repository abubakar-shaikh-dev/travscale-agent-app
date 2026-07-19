// Shared domain types — matches the Travscale Auth API reference.

export type USER_ROLES = "SUPER_ADMIN" | "AGENT";

export type USER_STATUS =
  | "PENDING_ACTIVATION"
  | "ACTIVE"
  | "SUSPENDED"
  | "DEACTIVATED";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: USER_ROLES;
  status: USER_STATUS;
}

/** Full session returned by /auth/login and /auth/register. */
export interface AuthSession {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
}

/** Partial session returned by /auth/refresh-token (no user). */
export interface RefreshSession {
  access_token: string;
  refresh_token: string;
}

// ---------------------------------------------------------------------------
// API envelope shapes
// ---------------------------------------------------------------------------

export interface ApiMeta {
  timestamp: string;
  request_id: string;
  path?: string;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta: ApiMeta;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  error: {
    code: string;
    details: ApiFieldError[] | null;
  };
  meta: ApiMeta;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** Error codes used by the auth API. */
export type AuthErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_CREDENTIALS"
  | "TOKEN_INVALID"
  | "TOKEN_EXPIRED"
  | "EMAIL_ALREADY_EXISTS"
  | "ALREADY_VERIFIED"
  | "USER_NOT_FOUND"
  | "UNAUTHORIZED"
  | "INTERNAL_ERROR";

// ---------------------------------------------------------------------------
// Request payloads
// ---------------------------------------------------------------------------

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  timezone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

export interface LogoutPayload {
  refresh_token: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}
