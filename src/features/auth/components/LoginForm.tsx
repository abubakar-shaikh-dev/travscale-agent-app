// React
import { Suspense, useState } from "react";

// Router
import { Link, useNavigate } from "@tanstack/react-router";

// Form
import { useAppForm } from "@/lib/form/form-context";

// Feature Components
import AuthSubmitButton from "./AuthSubmitButton";
import { useLogin } from "../queries";

// Utils
import { useAuthStore } from "@/lib/auth-store";
import { extractAuthError } from "../api";

// Types
export interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [succeeded, setSucceeded] = useState(false);
  // 423 ACCOUNT_LOCKED: the per-account lockout is server-side and the window
  // length is not reported: stop submitting entirely instead of letting the
  // user mash the button (auth-api-doc §6).
  const [locked, setLocked] = useState(false);

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await loginMutation.mutateAsync(value);
        setSucceeded(true);
        // Navigation is deferred until the success animation finishes: see
        // AuthSubmitButton's onSuccessComplete.
      } catch (error) {
        if (extractAuthError(error).code === "ACCOUNT_LOCKED") {
          setLocked(true);
        }
        // Other errors are surfaced by the mutation's onError handler.
      }
    },
  });

  return (
    <form.AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-6"
      >
        <Suspense fallback={null}>
          <form.AppField
            name="email"
            validators={{
              onBlur: ({ value }) => {
                if (!value) return "Email is required";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                  return "Please enter a valid email";
                return undefined;
              },
            }}
          >
            {(field) => (
              <field.InputField
                label="Email"
                type="email"
                placeholder="your.email@example.com"
                required
                disabled={loginMutation.isPending}
              />
            )}
          </form.AppField>

          <form.AppField
            name="password"
            validators={{
              onBlur: ({ value }) => {
                if (!value) return "Password is required";
                return undefined;
              },
            }}
          >
            {(field) => (
              <field.PasswordField
                label="Password"
                placeholder="Enter your password"
                required
                disabled={loginMutation.isPending}
              />
            )}
          </form.AppField>

          <div className="flex justify-end -mt-2">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <AuthSubmitButton
            label="Sign In"
            loadingLabel="Signing in..."
            successLabel="Login Succeeded"
            isSuccess={succeeded}
            onSuccessComplete={() => {
              // A PENDING_ACTIVATION account logs in fine but can't use the
              // app yet: it goes to the OTP screen instead of the dashboard.
              const status = useAuthStore.getState().user?.status;
              if (status === "PENDING_ACTIVATION") {
                navigate({ to: "/auth/verify-otp", replace: true });
                return;
              }
              navigate({ to: redirectTo ?? "/", replace: true });
            }}
            disabled={loginMutation.isPending || locked}
          />

          {locked && (
            <p
              role="alert"
              className="text-center text-sm text-destructive"
            >
              Too many failed attempts. This account is temporarily locked.
              Try again later.
            </p>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/auth/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Create account
            </Link>
          </p>
        </Suspense>
      </form>
    </form.AppForm>
  );
}
