// Router
import { createFileRoute, redirect } from "@tanstack/react-router";

// Feature Components
import { OnboardingPage } from "./-onboarding/OnboardingPage";

/**
 * The onboarding wizard lives outside the app shell: an account without an
 * agency and a first location has no dashboard to show yet (the product gate,
 * mirrored server-side by 403 ONBOARDING_INCOMPLETE).
 */
export const Route = createFileRoute("/onboarding")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/auth/login" });
    }

    // Onboarding routes sit behind the verified-email gate
    // (docs/api/onboarding-api.md §1).
    if (context.auth.user?.status === "PENDING_ACTIVATION") {
      throw redirect({ to: "/auth/verify-otp" });
    }

    // Already onboarded: nothing to do here.
    if (context.auth.user?.onboarding_completed === true) {
      throw redirect({ to: "/" });
    }
  },
  component: OnboardingPage,
});
