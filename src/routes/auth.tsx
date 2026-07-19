// Router
import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";

// UI Components
import { AuthLayout } from "@/components/auth-layout";

// Feature Components
import { AuthMethods } from "@/features/auth/components/AuthMethods";

// Types
import type { AuthPageMeta } from "@/components/auth-layout";

/**
 * Shared layout for every public auth page (login, register, forgot
 * password, verify email, reset password).
 *
 * Renders `<AuthLayout>` exactly once so the showcase `<aside>` (and its
 * background image), the logo, and the panel chrome stay mounted across
 * navigations between auth pages — only the `<Outlet>` (the form) swaps.
 * This avoids the image reload / animation replay flicker that happened
 * when each route rendered its own `<AuthLayout>`.
 *
 * For login & register, `<AuthMethods>` (Google button + "Continue with
 * Email" reveal) is rendered HERE, wrapping the `<Outlet>`, so it also
 * stays mounted across login↔register navigation: the Google button
 * never re-renders and the reveal state persists. Only the form fields
 * inside the `<Outlet>` swap.
 *
 * Per-page metadata is supplied by each child route via its `loader` and
 * read here off the deepest match.
 */
export const Route = createFileRoute("/auth")({
  component: AuthLayoutRoute,
});

function AuthLayoutRoute() {
  const matches = useMatches();
  const leaf = matches[matches.length - 1];
  const meta = (leaf.loaderData ?? {}) as Partial<AuthPageMeta>;

  return (
    <AuthLayout
      title={meta.title ?? ""}
      description={meta.description ?? ""}
      wide={meta.wide}
      showLegal={meta.showLegal}
    >
      {meta.authMethods ? (
        <AuthMethods>
          <Outlet />
        </AuthMethods>
      ) : (
        <Outlet />
      )}
    </AuthLayout>
  );
}
