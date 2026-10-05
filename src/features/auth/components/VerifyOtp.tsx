// React
import { useCallback, useEffect, useRef, useState } from "react";

// Router
import { useNavigate } from "@tanstack/react-router";

// Toast
import { toast } from "sonner";

// OTP
import { REGEXP_ONLY_DIGITS } from "input-otp";

// UI Components
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// Feature Components
import { useLogout, useResendOtp, useVerifyOtp } from "../queries";

// Utils
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { extractAuthError } from "../api";

export interface VerifyOtpProps {
  className?: string;
}

/**
 * Error codes where the server message alone isn't actionable: replace it
 * with copy that points at the resend flow (auth-api-doc §4.3: an expired or
 * over-guessed code and a wrong code mean different things to the user).
 */
// Keys are AuthErrorCode values; typed as Record<string, string> so the
// server-provided code string can index it without a cast.
const OTP_ERROR_COPY: Record<string, string> = {
  OTP_EXPIRED: "This code has expired. Request a new one below.",
  OTP_ATTEMPTS_EXCEEDED: "Too many incorrect attempts. Request a new code below.",
  UNAUTHORIZED: "Your session has expired. Please sign in again.",
};

// The resend cooldown is enforced server-side (60s from the previous code) and
// OTP_RESEND_TOO_SOON does not report the remaining time, so run a client-side
// 60s countdown and keep the button disabled until it ends (auth-api-doc §4.4).
const RESEND_COOLDOWN_SECONDS = 60;

/** Shared styling for inline text-link actions in the auth panels. */
const AUTH_LINK_CLASS =
  "cursor-pointer font-medium text-primary underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-64";

export function VerifyOtp({ className }: VerifyOtpProps) {
  const navigate = useNavigate();
  const verifyMutation = useVerifyOtp();
  const resendMutation = useResendOtp();
  const logoutMutation = useLogout();
  const user = useAuthStore((s) => s.user);

  const [value, setValue] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const handledAlreadyVerifiedRef = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(
      () => setCooldown((s) => (s <= 1 ? 0 : s - 1)),
      1000
    );
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleAlreadyVerified = useCallback(
    (message: string) => {
      // Verification flips the account to ACTIVE: keep the local session's
      // user in sync so route guards stop sending the user to the OTP screen.
      const current = useAuthStore.getState().user;
      if (current && current.status !== "ACTIVE") {
        useAuthStore.getState().setUser({ ...current, status: "ACTIVE" });
      }
      toast.success(message);
      navigate({ to: "/", replace: true });
    },
    [navigate]
  );

  // A 409 ALREADY_VERIFIED from verify-otp means the account is done: treat
  // it as success and leave the OTP screen.
  useEffect(() => {
    if (!verifyMutation.isError || handledAlreadyVerifiedRef.current) return;
    const { code, message } = extractAuthError(verifyMutation.error);
    if (code === "ALREADY_VERIFIED") {
      handledAlreadyVerifiedRef.current = true;
      handleAlreadyVerified(message);
    }
  }, [verifyMutation.isError, verifyMutation.error, handleAlreadyVerified]);

  const submitCode = (code: string) => {
    verifyMutation.mutate(
      { code },
      {
        onError: (error) => {
          // Clear the entry after a failed attempt so the user starts fresh
          // and the auto-submit re-arms for the next code.
          const { code: errorCode } = extractAuthError(error);
          if (errorCode !== "ALREADY_VERIFIED") setValue("");
        },
      }
    );
  };

  const handleChange = (next: string) => {
    setValue(next);
    // Auto-submit as soon as the sixth digit lands.
    if (
      next.length === 6 &&
      !verifyMutation.isPending &&
      !verifyMutation.isSuccess
    ) {
      submitCode(next);
    }
  };

  const handleVerifyClick = () => submitCode(value);

  const handleResend = () => {
    resendMutation.mutate(undefined, {
      onSuccess: () => setCooldown(RESEND_COOLDOWN_SECONDS),
      onError: (error) => {
        const { code, message } = extractAuthError(error);
        if (code === "OTP_RESEND_TOO_SOON") {
          setCooldown(RESEND_COOLDOWN_SECONDS);
        } else if (code === "ALREADY_VERIFIED") {
          handledAlreadyVerifiedRef.current = true;
          handleAlreadyVerified(message);
        }
      },
    });
  };

  const handleSwitchAccount = () => {
    // The session is bound to the (wrong) email: revoke it server-side and
    // return to login. useLogout clears the local session in its own
    // onSettled, whether or not the server call succeeds.
    const refresh_token = useAuthStore.getState().refresh_token ?? "";
    logoutMutation.mutate(
      { refresh_token },
      { onSettled: () => navigate({ to: "/auth/login" }) }
    );
  };

  if (verifyMutation.isSuccess) {
    return (
      <div className={cn("space-y-6 auth-fade", className)}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
            <svg
              viewBox="0 0 24 24"
              className="size-7 shrink-0"
              aria-hidden="true"
              fill="none"
            >
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="auth-draw"
              />
            </svg>
          </div>
          <div className="space-y-1.5">
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              Email verified
            </h2>
            <p className="text-sm text-muted-foreground">
              Your email has been confirmed. You're all set to use Travscale.
            </p>
          </div>
        </div>
        <Button
          className="w-full"
          onClick={() => navigate({ to: "/", replace: true })}
        >
          Continue to Dashboard
        </Button>
      </div>
    );
  }

  const verifyError = verifyMutation.isError
    ? extractAuthError(verifyMutation.error)
    : null;

  // The code is dead (expired or the guess budget is spent): no point
  // submitting it again; the user needs a fresh one via resend.
  const isDeadCode =
    verifyError?.code === "OTP_EXPIRED" ||
    verifyError?.code === "OTP_ATTEMPTS_EXCEEDED";

  const errorText = verifyError
    ? (verifyError.code && OTP_ERROR_COPY[verifyError.code]) ??
      verifyError.message
    : null;

  return (
    <div className={cn("space-y-6 auth-fade", className)}>
      {/* The email chip sits at the point of use: "which address?" is asked
          right here, so the correction action lives here too (Gmail/Linear
          pattern) instead of exiled to a footer. The whole block shakes on a
          failed attempt so a wrong code is felt, not just read. */}
      <div className={cn("space-y-2", verifyError && "otp-shake")}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Sent to</span>
          <span className="inline-flex min-w-0 max-w-56 items-center rounded-md bg-muted px-2 py-0.5 sm:max-w-64">
            <span className="truncate font-medium text-foreground">
              {user?.email}
            </span>
          </span>
          <button
            type="button"
            className={AUTH_LINK_CLASS}
            disabled={logoutMutation.isPending}
            onClick={handleSwitchAccount}
          >
            Change
          </button>
        </div>

        {/* Full-width h-11 slots so the control aligns with the standard
            auth-panel inputs ([&_[data-slot=input]]:h-11 in auth-layout).
            autoComplete="one-time-code" lets mobile OSes offer the code from
            SMS/email; REGEXP_ONLY_DIGITS blocks non-numeric input. */}
        <InputOTP
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          value={value}
          onChange={handleChange}
          disabled={verifyMutation.isPending || resendMutation.isPending}
          containerClassName="w-full"
          aria-label="Verification code"
        >
          <InputOTPGroup className="w-full">
            <InputOTPSlot
              index={0}
              className="h-11 w-full flex-1 text-base sm:h-11 sm:w-full sm:text-lg"
            />
            <InputOTPSlot
              index={1}
              className="h-11 w-full flex-1 text-base sm:h-11 sm:w-full sm:text-lg"
            />
            <InputOTPSlot
              index={2}
              className="h-11 w-full flex-1 text-base sm:h-11 sm:w-full sm:text-lg"
            />
            <InputOTPSlot
              index={3}
              className="h-11 w-full flex-1 text-base sm:h-11 sm:w-full sm:text-lg"
            />
            <InputOTPSlot
              index={4}
              className="h-11 w-full flex-1 text-base sm:h-11 sm:w-full sm:text-lg"
            />
            <InputOTPSlot
              index={5}
              className="h-11 w-full flex-1 text-base sm:h-11 sm:w-full sm:text-lg"
            />
          </InputOTPGroup>
        </InputOTP>

        {errorText && (
          <p role="alert" className="text-sm text-destructive">
            {errorText}
          </p>
        )}
      </div>

      <Button
        className="w-full"
        disabled={value.length < 6 || isDeadCode || resendMutation.isPending}
        loading={verifyMutation.isPending}
        onClick={handleVerifyClick}
      >
        Verify Email
      </Button>

      {/* Recovery: resend is the stuck user's primary action, so it gets a
          real button (the countdown then reads as a natural disabled state);
          the spam hint hangs under it as its caption. */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          disabled={resendMutation.isPending || cooldown > 0}
          loading={resendMutation.isPending}
          onClick={handleResend}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Check your spam or promotions folder.
        </p>
      </div>
    </div>
  );
}
