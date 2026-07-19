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
  resendVerificationApi,
  resetPasswordApi,
  verifyEmailApi,
} from "./api";

// Types
import type {
  ForgotPasswordPayload,
  LoginPayload,
  LogoutPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
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
      // animation — no toast.
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
      // animation — no toast.
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

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (payload: VerifyEmailPayload) => verifyEmailApi(payload),
    onSuccess: (message) => toast.success(message),
    onError: (error) => notifyError(error),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: () => resendVerificationApi(),
    onSuccess: (message) => toast.success(message),
    onError: (error) => notifyError(error),
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
