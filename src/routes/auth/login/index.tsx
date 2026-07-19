// Zod
import { z } from "zod";

// Router
import { createFileRoute, redirect } from "@tanstack/react-router";

// UI Components
import { AuthLayout } from "@/components/auth-layout";

// Feature Components
import { LoginForm } from "@/features/auth/components/LoginForm";

export const Route = createFileRoute("/auth/login/")({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  beforeLoad: ({ context }) => {
    // Already signed in — no need to see the login page.
    if (context.auth.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { redirect } = Route.useSearch();
  return (
    <AuthLayout
      title="Welcome Back!"
      description="Sign in to your account to continue."
    >
      <LoginForm redirectTo={redirect} />
    </AuthLayout>
  );
}
