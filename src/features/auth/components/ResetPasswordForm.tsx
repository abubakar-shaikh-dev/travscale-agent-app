// React
import { Suspense } from "react";

// Router
import { useNavigate } from "@tanstack/react-router";

// UI Components
import { Button } from "@/components/ui/button";

// Form
import { useAppForm } from "@/lib/form/form-context";

// Feature Components
import { useResetPassword } from "../queries";

export interface ResetPasswordFormProps {
  className?: string;
  token: string;
}

export function ResetPasswordForm({ className, token }: ResetPasswordFormProps) {
  const navigate = useNavigate();
  const resetPasswordMutation = useResetPassword();

  const form = useAppForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await resetPasswordMutation.mutateAsync({
          token,
          password: value.password,
        });
        // Resetting revokes all sessions, so send the user back to sign in.
        navigate({ to: "/auth/login", replace: true });
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
        className={`space-y-4 ${className ?? ""}`}
      >
        <Suspense fallback={null}>
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
                label="New Password"
                placeholder="Create a new password"
                hint="Must be at least 8 characters"
                required
                disabled={resetPasswordMutation.isPending}
              />
            )}
          </form.AppField>

          <form.AppField
            name="confirmPassword"
            validators={{
              onChangeListenTo: ["password"],
              onBlur: ({ value, fieldApi }) => {
                if (!value) return "Please confirm your password";
                const password = fieldApi.form.getFieldValue("password");
                if (value !== password) return "Passwords do not match";
                return undefined;
              },
            }}
          >
            {(field) => (
              <field.PasswordField
                label="Confirm Password"
                placeholder="Re-enter your new password"
                required
                disabled={resetPasswordMutation.isPending}
              />
            )}
          </form.AppField>

          <form.Subscribe
            selector={(state) => ({
              isSubmitting: state.isSubmitting,
              canSubmit: state.canSubmit,
            })}
          >
            {({ isSubmitting, canSubmit }) => (
              <Button
                type="submit"
                className="w-full"
                loading={isSubmitting || resetPasswordMutation.isPending}
                disabled={!canSubmit || resetPasswordMutation.isPending}
              >
                {isSubmitting || resetPasswordMutation.isPending
                  ? "Resetting password..."
                  : "Reset password"}
              </Button>
            )}
          </form.Subscribe>
        </Suspense>
      </form>
    </form.AppForm>
  );
}
