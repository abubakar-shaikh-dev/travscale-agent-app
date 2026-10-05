// Router
import { createFileRoute, redirect } from "@tanstack/react-router";

// Feature Components
import { WelcomeScreen } from "./-onboarding/components/WelcomeScreen";

// Utils
import { consumeWelcomeTicket } from "@/features/onboarding/welcome-ticket";

/**
 * The post-onboarding arrival screen. Sits outside the app shell on purpose:
 * the full-bleed welcome moment plays before the dashboard exists on screen,
 * mirroring how /onboarding lives outside the shell too.
 *
 * One-shot by design: the guard consumes the ticket granted right after
 * POST /onboarding/complete succeeds. A manual visit, a back-navigation, or
 * a new tab finds no ticket and lands on the dashboard instead of replaying
 * the celebration.
 */
export const Route = createFileRoute("/welcome")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/auth/login" });
    }

    if (context.auth.user?.status === "PENDING_ACTIVATION") {
      throw redirect({ to: "/auth/verify-otp" });
    }

    if (context.auth.user?.onboarding_completed === false) {
      throw redirect({ to: "/onboarding" });
    }

    // Checked last so a guarded redirect above never burns the ticket.
    if (!consumeWelcomeTicket()) {
      throw redirect({ to: "/", replace: true });
    }
  },
  component: WelcomeScreen,
});
