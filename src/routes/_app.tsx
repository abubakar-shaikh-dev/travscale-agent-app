// Router
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

/**
 * Pathless layout guard for protected routes.
 *
 * Anything under `routes/_app/` requires an authenticated session. Unauthenticated
 * visitors are redirected to the login page with the intended destination preserved
 * in the `redirect` search param so login can send them back.
 *
 * Registered-but-unverified accounts ARE authenticated (register/login already hand
 * out tokens) but every protected API answers 403 EMAIL_NOT_VERIFIED, so they are
 * routed to the OTP screen up front instead of failing per-request.
 */
export const Route = createFileRoute("/_app")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/auth/login",
        search: { redirect: location.href },
      });
    }

    if (context.auth.user?.status === "PENDING_ACTIVATION") {
      throw redirect({ to: "/auth/verify-otp" });
    }
  },
  component: () => <Outlet />,
});
