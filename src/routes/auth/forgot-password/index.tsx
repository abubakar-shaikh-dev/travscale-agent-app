// Router
import { createFileRoute, redirect } from "@tanstack/react-router";

// UI Components
import { AuthLayout } from "@/components/auth-layout";

// Feature Components
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const Route = createFileRoute("/auth/forgot-password/")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthLayout
      title="Forgot Password"
      description="Enter your email and we'll send you a reset link."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
