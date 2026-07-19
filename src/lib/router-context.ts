// Types
import type { AuthUser } from "@/features/auth/types";

/**
 * Context injected into the TanStack router on every render.
 *
 * `auth` is derived from the Zustand auth store in `main.tsx` and re-read by
 * route guards (`beforeLoad`) synchronously — no per-navigation network call.
 */
export interface RouterContext {
  auth: {
    isAuthenticated: boolean;
    user: AuthUser | null;
  };
}
