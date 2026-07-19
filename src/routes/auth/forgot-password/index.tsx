// Router
import { createFileRoute, redirect } from "@tanstack/react-router";

// UI Components
import type { AuthPageMeta } from "@/components/auth-layout";

// Feature Components
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const Route = createFileRoute("/auth/forgot-password/")({
  loader: (): AuthPageMeta => ({
    title: "Forgot Password",
    description: "Enter your email and we'll send you a reset link.",
    showLegal: false,
  }),
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <ForgotPasswordForm />;
}
