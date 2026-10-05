// Router
import { createFileRoute, redirect } from "@tanstack/react-router";

// UI Components
import type { AuthPageMeta } from "@/components/auth-layout";

// Feature Components
import { VerifyOtp } from "@/features/auth/components/VerifyOtp";

export const Route = createFileRoute("/auth/verify-otp/")({
  loader: (): AuthPageMeta => ({
    title: "Verify Your Email",
    // The email itself is shown as a chip with a Change action inside the
    // VerifyOtp component, at the point where the user asks about it.
    description: "Enter the 6-digit code we emailed you to continue.",
    showLegal: false,
  }),
  beforeLoad: ({ context }) => {
    // The OTP endpoints authenticate via the bearer token handed out at
    // register/login, so an unauthenticated visitor has nothing to verify.
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/auth/login" });
    }

    // Already verified: nothing to do here.
    if (context.auth.user?.status === "ACTIVE") {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <VerifyOtp />;
}
