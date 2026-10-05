// Query
import { useMutation } from "@tanstack/react-query";

// Lib
import { useAuthStore } from "@/lib/auth-store";

// Toast
import { toast } from "sonner";

// API
import {
  extractAuthError,
  forgotPasswordApi,
  loginApi,
  logoutApi,
  registerApi,
  resendOtpApi,
  resetPasswordApi,
  verifyOtpApi,
} from "./api";

// Types
import type {
  ForgotPasswordPayload,
  LoginPayload,
  LogoutPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyOtpPayload,
} from "./types";

function notifyError(error: unknown): void {
  const { message } = extractAuthError(error);
  toast.error(message);
}

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => loginApi(payload),
    onSuccess: (session) => {
      useAuthStore.getState().setSession(session);
      // Success feedback is shown in-button via AuthSubmitButton's tick
      // animation: no toast.
    },
    onError: (error) => notifyError(error),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerApi(payload),
    onSuccess: (session) => {
      useAuthStore.getState().setSession(session);
      // Success feedback is shown in-button via AuthSubmitButton's tick
      // animation: no toast.
    },
    onError: (error) => notifyError(error),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: (payload: LogoutPayload) => logoutApi(payload),
    // Always clear the local session, whether or not the server call succeeds,
    // so the user is signed out even on network failure.
    onSettled: () => {
      useAuthStore.getState().clear();
    },
    onError: (error) => notifyError(error),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifyOtpApi(payload),
    onSuccess: (message) => {
      // Verification flips the account to ACTIVE: keep the local session's
      // user in sync so route guards stop sending the user to the OTP screen.
      const user = useAuthStore.getState().user;
      if (user && user.status !== "ACTIVE") {
        useAuthStore.getState().setUser({ ...user, status: "ACTIVE" });
      }
      toast.success(message);
    },
    // No onError toast: the VerifyOtp component renders inline errors and
    // branches on the error code (invalid / expired / attempts exceeded).
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: () => resendOtpApi(),
    onSuccess: (message) => toast.success(message),
    // No onError toast: the component branches on the code: a 429
    // OTP_RESEND_TOO_SOON starts a 60s countdown, 409 ALREADY_VERIFIED
    // routes to the dashboard.
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPasswordApi(payload),
    onSuccess: (message) => toast.success(message),
    onError: (error) => notifyError(error),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPasswordApi(payload),
    onSuccess: (message) => {
      // Resetting revokes all refresh tokens server-side, so the local session
      // is no longer trustworthy.
      useAuthStore.getState().clear();
      toast.success(message);
    },
    onError: (error) => notifyError(error),
  });
}
