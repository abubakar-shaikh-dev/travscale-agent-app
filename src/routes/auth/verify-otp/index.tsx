// Router
import { createFileRoute, redirect } from "@tanstack/react-router";

// UI Components
import type { AuthPageMeta } from "@/components/auth-layout";

// Feature Components
import { VerifyOtp } from "@/features/auth/components/VerifyOtp";

// Utils
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/auth/verify-otp/")({
  loader: (): AuthPageMeta => {
    // The email belongs in the layout's description slot (same slot as the
    // login page's "Sign in to your account to continue."), so the form body
    // stays field-only like every other auth page.
    const email = useAuthStore.getState().user?.email;
    return {
      title: "Verify Your Email",
      description: email
        ? `We sent a 6-digit code to ${email}. Enter it below to continue.`
        : "Enter the 6-digit code we emailed you to continue.",
      showLegal: false,
    };
  },
  beforeLoad: ({ context }) => {
    // The OTP endpoints authenticate via the bearer token handed out at
    // register/login, so an unauthenticated visitor has nothing to verify.
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/auth/login" });
    }

    // Already verified — nothing to do here.
    if (context.auth.user?.status === "ACTIVE") {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <VerifyOtp />;
}
