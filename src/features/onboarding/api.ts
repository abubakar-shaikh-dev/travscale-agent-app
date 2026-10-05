// Axios
import { axiosInstance } from "@/lib/axios";

// Types
import type { OnboardingStatus } from "./types";

/** Unwrap the success envelope, returning the inner data. */
function unwrap<T>(response: { data: { data: T } }): T {
  return response.data.data;
}

/**
 * GET /onboarding/status (docs/api/onboarding-api.md §5.1). The single source
 * of truth for which wizard screen to render; call after every step.
 */
export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  return unwrap(await axiosInstance.get("/onboarding/status"));
}

/**
 * POST /onboarding/complete (docs/api/onboarding-api.md §5.2). Validates the
 * steps server-side and stamps onboarding done. Idempotent.
 */
export async function completeOnboarding(): Promise<OnboardingStatus> {
  return unwrap(await axiosInstance.post("/onboarding/complete"));
}
