// Shared domain types: matches the Travscale Onboarding API reference
// (docs/api/onboarding-api.md).

/** The screen the wizard should render next (docs/api/onboarding-api.md §4). */
export type OnboardingNextStep = "agency" | "location" | "done";

export interface OnboardingSteps {
  /** An active agency exists for the account. */
  agency_created: boolean;
  /** The agency has at least one active (non-soft-deleted) location. */
  location_added: boolean;
  /** Informational only: logo_key can be stale after a storage delete. */
  logo_uploaded: boolean;
}

export interface OnboardingStatus {
  steps: OnboardingSteps;
  next_step: OnboardingNextStep;
  onboarding_completed: boolean;
}

/** Error codes used by the onboarding module (docs/api/onboarding-api.md §5.3). */
export type OnboardingErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "EMAIL_NOT_VERIFIED"
  | "ACCOUNT_SUSPENDED"
  | "ONBOARDING_INCOMPLETE"
  | "AGENCY_NOT_FOUND"
  | "USER_NOT_FOUND";
