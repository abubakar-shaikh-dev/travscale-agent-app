// React
import { Suspense, useState } from "react";

// Router
import { Link } from "@tanstack/react-router";

// UI Components
import { Button } from "@/components/ui/button";

// Form
import { useAppForm } from "@/lib/form/form-context";

// Feature Components
import { useForgotPassword } from "../queries";

export interface ForgotPasswordFormProps {
  className?: string;
}

export function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
  const forgotPasswordMutation = useForgotPassword();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await forgotPasswordMutation.mutateAsync({ email: value.email });
        setSubmittedEmail(value.email);
      } catch {
        // Error toast is surfaced by the mutation's onError handler.
      }
    },
  });

  if (submittedEmail) {
    return (
      <div className={`space-y-4 ${className ?? ""}`}>
        <p className="text-sm text-muted-foreground">
          If an account exists for{" "}
          <span className="font-medium text-foreground">{submittedEmail}</span>,
          a reset link has been sent. Check your inbox and follow the link to
          set a new password.
        </p>
        <Button render={<Link to="/auth/login" />} className="w-full">
          Back to sign in
        </Button>
      </div>
    );
  }

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
                disabled={forgotPasswordMutation.isPending}
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
                loading={isSubmitting || forgotPasswordMutation.isPending}
                disabled={!canSubmit || forgotPasswordMutation.isPending}
              >
                {isSubmitting || forgotPasswordMutation.isPending
                  ? "Sending link..."
                  : "Send reset link"}
              </Button>
            )}
          </form.Subscribe>

          <p className="text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link
              to="/auth/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </Suspense>
      </form>
    </form.AppForm>
  );
}
