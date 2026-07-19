// Router
import { createFileRoute, redirect } from "@tanstack/react-router";

// UI Components
import type { AuthPageMeta } from "@/components/auth-layout";

// Feature Components
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const Route = createFileRoute("/auth/register/")({
  loader: (): AuthPageMeta => ({
    title: "Create your account",
    description: "It only takes a minute to get started.",
    authMethods: true,
  }),
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <RegisterForm />;
}
