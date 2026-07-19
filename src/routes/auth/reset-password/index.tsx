// Zod
import { z } from "zod";

// Router
import { createFileRoute, redirect } from "@tanstack/react-router";

// UI Components
import { AuthLayout } from "@/components/auth-layout";

// Feature Components
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export const Route = createFileRoute("/auth/reset-password/")({
  validateSearch: z.object({
    token: z.string().min(1),
  }),
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useSearch();
  return (
    <AuthLayout
      title="Reset Password"
      description="Choose a new password for your account."
      showLegal={false}
    >
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
