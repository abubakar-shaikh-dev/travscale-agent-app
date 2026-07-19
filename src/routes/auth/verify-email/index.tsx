// Zod
import { z } from "zod";

// Router
import { createFileRoute } from "@tanstack/react-router";

// UI Components
import { AuthLayout } from "@/components/auth-layout";

// Feature Components
import { VerifyEmail } from "@/features/auth/components/VerifyEmail";

export const Route = createFileRoute("/auth/verify-email/")({
  // Token is delivered via the email link's query string. It may be absent if
  // someone navigates here manually — the component handles that case.
  validateSearch: z.object({
    token: z.string().optional(),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useSearch();
  return (
    <AuthLayout
      title="Verify Your Email"
      description="Confirming your email address."
      showLegal={false}
    >
      <VerifyEmail token={token ?? ""} />
    </AuthLayout>
  );
}
