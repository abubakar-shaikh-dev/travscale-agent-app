// Types
import type { AuthUser } from "./types";

/**
 * Resolve where a freshly signed-in user should land. Shared by every sign-in
 * path (email login, Google) so the routing order stays identical.
 *
 * Order matters:
 * 1. A PENDING_ACTIVATION account logs in fine but can't use the app yet:
 *    it goes to the OTP screen instead of the dashboard.
 * 2. An account without agency + location onboarding goes to the wizard
 *    before any dashboard (onboarding-api-doc §6).
 * 3. Everyone else goes to their originally requested page, or the dashboard.
 */
export function resolvePostAuthRoute(
  user: AuthUser | null,
  redirectTo?: string
): string {
  if (user?.status === "PENDING_ACTIVATION") return "/auth/verify-otp";
  if (user?.onboarding_completed === false) return "/onboarding";
  return redirectTo ?? "/";
}
