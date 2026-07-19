// React
import { Suspense, useState } from "react";

// Router
import { Link, useNavigate } from "@tanstack/react-router";

// Form
import { useAppForm } from "@/lib/form/form-context";

// Feature Components
import AuthSubmitButton from "./AuthSubmitButton";
import { useRegister } from "../queries";

// Types
import type { RegisterPayload } from "../types";

function detectTimezone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

export function RegisterForm() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [succeeded, setSucceeded] = useState(false);

  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const payload: RegisterPayload = {
        name: value.name,
        email: value.email,
        password: value.password,
      };
      const timezone = detectTimezone();
      if (timezone) payload.timezone = timezone;

      try {
        await registerMutation.mutateAsync(payload);
        setSucceeded(true);
        // Navigation is deferred until the success animation finishes — see
        // AuthSubmitButton's onSuccessComplete.
      } catch {
        // Error toast is surfaced by the mutation's onError handler.
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
            name="name"
            validators={{
              onBlur: ({ value }) => {
                if (!value) return "Full name is required";
                if (value.length < 2)
                  return "Name must be at least 2 characters";
                if (value.length > 100)
                  return "Name must be at most 100 characters";
                return undefined;
              },
            }}
          >
            {(field) => (
              <field.InputField
                label="Full Name"
                placeholder="John Doe"
                required
                disabled={registerMutation.isPending}
              />
            )}
          </form.AppField>

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
                disabled={registerMutation.isPending}
              />
            )}
          </form.AppField>

          <form.AppField
            name="password"
            validators={{
              onBlur: ({ value }) => {
                if (!value) return "Password is required";
                if (value.length < 8)
                  return "Password must be at least 8 characters";
                if (value.length > 100)
                  return "Password must be at most 100 characters";
                return undefined;
              },
            }}
          >
            {(field) => (
              <field.PasswordField
                label="Password"
                placeholder="Create a password"
                required
                disabled={registerMutation.isPending}
              />
            )}
          </form.AppField>

          <AuthSubmitButton
            label="Create Account"
            loadingLabel="Creating account..."
            successLabel="Account Created"
            isSuccess={succeeded}
            onSuccessComplete={() => navigate({ to: "/", replace: true })}
            disabled={registerMutation.isPending}
          />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </Suspense>
      </form>
    </form.AppForm>
  );
}
