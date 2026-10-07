// Zustand
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Tenant store — the agency context the session operates in.
 *
 * The agency and its locations are server state (features/agencies via
 * TanStack Query); only the user's choice of active location is client
 * state, persisted so a reload lands on the same branch. Location-scoped
 * queries read `active_location_id` and include it in their query keys, so
 * switching a branch re-resolves data under the new location.
 */
interface TenantState {
  active_location_id: string | null;
  setActiveLocation: (locationId: string) => void;
  clear: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      active_location_id: null,
      setActiveLocation: (active_location_id) => set({ active_location_id }),
      clear: () => set({ active_location_id: null }),
    }),
    {
      name: "travscale-tenant",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        active_location_id: state.active_location_id,
      }),
    }
  )
);

// Selector helpers — use these with the hook to keep subscriptions narrow.
export const selectActiveLocationId = (s: TenantState): string | null =>
  s.active_location_id;
