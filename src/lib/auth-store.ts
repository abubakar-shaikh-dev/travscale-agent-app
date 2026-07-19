// Zustand
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Types
import type {
  AuthSession,
  AuthUser,
  RefreshSession,
} from "@/features/auth/types";

/**
 * Auth store — single source of truth for session state.
 *
 * Design notes:
 * - Tokens + user are persisted to localStorage so the session survives reloads.
 * - The store is readable outside React via `useAuthStore.getState()`, which the
 *   axios interceptor relies on to attach the Bearer token synchronously.
 * - Action helpers (setSession / setTokens / clear) keep mutations in one place
 *   so callers never touch the raw shape of the persisted state.
 */
interface AuthState {
  user: AuthUser | null;
  access_token: string | null;
  refresh_token: string | null;
  setSession: (session: AuthSession) => void;
  setTokens: (tokens: RefreshSession) => void;
  setUser: (user: AuthUser) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      setSession: (session) =>
        set({
          user: session.user,
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }),
      setTokens: (tokens) =>
        set({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        }),
      setUser: (user) => set({ user }),
      clear: () =>
        set({ user: null, access_token: null, refresh_token: null }),
    }),
    {
      name: "travscale-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        access_token: state.access_token,
        refresh_token: state.refresh_token,
      }),
    }
  )
);

// Selector helpers — use these with the hook to keep subscriptions narrow.
export const selectIsAuthenticated = (s: AuthState): boolean =>
  !!s.access_token;
export const selectUser = (s: AuthState): AuthUser | null => s.user;
export const selectAccessToken = (s: AuthState): string | null =>
  s.access_token;
export const selectRefreshToken = (s: AuthState): string | null =>
  s.refresh_token;
