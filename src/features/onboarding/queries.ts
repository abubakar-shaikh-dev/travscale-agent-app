// Query
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Lib
import { useAuthStore } from "@/lib/auth-store";

// API
import { completeOnboarding, getOnboardingStatus } from "./api";

// Query keys
export const onboardingKeys = {
  all: ["onboarding"] as const,
  status: () => [...onboardingKeys.all, "status"] as const,
};

/**
 * GET /onboarding/status. Fresh on every mount: the wizard renders directly
 * off `next_step`, so a cached value could send a resumed user to the wrong
 * screen.
 */
export function useOnboardingStatus() {
  return useQuery({
    queryKey: onboardingKeys.status(),
    queryFn: getOnboardingStatus,
    staleTime: 0,
  });
}

/**
 * POST /onboarding/complete. On success the local session's user is stamped
 * `onboarding_completed: true` so the route guards unlock the dashboard
 * immediately (the refresh-token response carries no user to re-read it from).
 */
export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: (status) => {
      const user = useAuthStore.getState().user;
      if (user && !user.onboarding_completed) {
        useAuthStore.getState().setUser({ ...user, onboarding_completed: true });
      }
      queryClient.setQueryData(onboardingKeys.status(), status);
    },
  });
}
