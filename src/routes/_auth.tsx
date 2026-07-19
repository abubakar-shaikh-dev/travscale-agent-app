// Router
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

/**
 * Pathless layout guard for protected routes.
 *
 * Anything under `routes/_auth/` requires an authenticated session. Unauthenticated
 * visitors are redirected to the login page with the intended destination preserved
 * in the `redirect` search param so login can send them back.
 */
export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/auth/login",
        search: { redirect: location.href },
      });
    }
  },
  component: () => <Outlet />,
});
