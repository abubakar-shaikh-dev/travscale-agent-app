// React
import type React from "react";
import { useEffect, useRef, useState } from "react";

// Router
import { useNavigate } from "@tanstack/react-router";

// Query
import { useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import {
  HashIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "lucide-react";

// Feature Queries
import { useAgencyLocations, useMyAgency } from "@/features/agencies/queries";
import { onboardingKeys, useCompleteOnboarding } from "@/features/onboarding/queries";

// Utils
import { extractApiError } from "@/lib/api-error";
import { getCountryName, getStateName } from "@/lib/geo";
import { cn } from "@/lib/utils";

// Types
import type { AgencyLocation } from "@/features/agencies/types";

/** Resolve "City, State, Country" for a location from the lazy geo dataset. */
function useWhereLabel(location: AgencyLocation | undefined): string | null {
  const id = location?.id;
  const [state, setState] = useState<{ id: string | undefined; label: string | null }>({
    id: undefined,
    label: null,
  });

  // Render-time reset when the location changes (no stale label flicker).
  if (state.id !== id) {
    setState({ id, label: null });
  }

  useEffect(() => {
    if (!location) return;
    let alive = true;
    void (async () => {
      const parts = [
        location.city,
        location.state_code
          ? await getStateName(location.country_code, location.state_code)
          : null,
        await getCountryName(location.country_code),
      ].filter(Boolean);
      if (alive) setState({ id, label: parts.length > 0 ? parts.join(", ") : null });
    })();
    return () => {
      alive = false;
    };
    // Reload only when the location itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return state.id === id ? state.label : null;
}

// Feature Components
import { LogoPicker } from "./LogoPicker";

interface SummaryRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function SummaryRow({ icon, label, value }: SummaryRowProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

/**
 * Last onboarding screen: a summary of what was created, an optional logo,
 * and the explicit POST /onboarding/complete that unlocks the dashboard
 * (docs/api/onboarding-api.md §5.2, "Completion is explicit").
 */
export function FinishStep() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const complete = useCompleteOnboarding();
  const [succeeded, setSucceeded] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const completedRef = useRef(false);

  const agencyQuery = useMyAgency({ enabled: true });
  const locationsQuery = useAgencyLocations({ page: 1, limit: 1 });

  const agency = agencyQuery.data;
  const location = locationsQuery.data?.items[0];
  const where = useWhereLabel(location);

  // Hold the success state long enough to read, then hand over to the app
  // (same rhythm as the auth submit button).
  useEffect(() => {
    if (!succeeded || completedRef.current) return;
    completedRef.current = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(
      () => navigate({ to: "/", replace: true }),
      reduced ? 400 : 1100
    );
    return () => clearTimeout(t);
  }, [succeeded, navigate]);

  const handleComplete = async () => {
    setSubmitError(null);
    try {
      await complete.mutateAsync();
      setSucceeded(true);
    } catch (error) {
      const info = extractApiError(error);
      if (info.code === "ONBOARDING_INCOMPLETE" || info.code === "AGENCY_NOT_FOUND") {
        // A step regressed server-side (e.g. the location was soft deleted in
        // another tab): re-drive the wizard from the status endpoint.
        toast.error("Your setup is missing a step. Taking you back.");
        await queryClient.invalidateQueries({ queryKey: onboardingKeys.status() });
        return;
      }
      setSubmitError(info.message);
    }
  };

  if (agencyQuery.isPending || locationsQuery.isPending) {
    return (
      <div className="space-y-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-md" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-44" />
            </div>
          </div>
        ))}
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="auth-stagger space-y-8">
      {/* Success mark: the moment of arrival. Drawn once, no confetti. */}
      <div className="flex items-center gap-4">
        <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
          <span
            aria-hidden="true"
            className="success-ping-ring absolute inset-0 rounded-full bg-success/12 [animation:success-ping_600ms_var(--motion-ease-out)_200ms_both]"
          />
          <svg
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4.5 12.5 9.5 18 19.5 6" className="auth-draw" />
          </svg>
        </span>
        <div>
          <p className="font-heading text-base font-semibold">
            Agency and first location are live
          </p>
          <p className="text-sm text-muted-foreground">
            Add a logo if you have one handy, then head in.
          </p>
        </div>
      </div>

      {/* Brand identity: the logo is the review's face. A divider section,
          not a card, so the summary reads as one continuous page. */}
      {agency && (
        <div className="border-t pt-6">
          <LogoPicker agency={agency} />
        </div>
      )}

      {/* What was actually created: real data, not marketing. */}
      {agency && (
        <div className="space-y-4 border-t pt-6">
          {agency.email && (
            <SummaryRow
              icon={<MailIcon className="size-4" aria-hidden="true" />}
              label="Email"
              value={agency.email}
            />
          )}
          {agency.phone && (
            <SummaryRow
              icon={<PhoneIcon className="size-4" aria-hidden="true" />}
              label="Phone"
              value={agency.phone}
            />
          )}
          {location && (
            <SummaryRow
              icon={<MapPinIcon className="size-4" aria-hidden="true" />}
              label="First location"
              value={
                <span className="flex flex-wrap items-baseline gap-x-2">
                  {location.name}
                  {where && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {where}
                    </span>
                  )}
                </span>
              }
            />
          )}
          {location && (
            <SummaryRow
              icon={<HashIcon className="size-4" aria-hidden="true" />}
              label="Code"
              value={
                <span className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/8 px-1.5 py-0.5 font-mono text-xs font-semibold">
                    {location.code}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    deals in {location.currency}
                  </span>
                </span>
              }
            />
          )}
        </div>
      )}

      {submitError && (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      )}

      <Button
        className={cn("w-full", succeeded && "border-success bg-success text-white hover:bg-success")}
        disabled={complete.isPending || succeeded}
        onClick={() => void handleComplete()}
      >
        {succeeded ? (
          <span className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12.5 10 18 19 6.5" className="auth-draw" />
            </svg>
            You're all set
          </span>
        ) : complete.isPending ? (
          "Finishing setup..."
        ) : (
          "Go to dashboard"
        )}
      </Button>
    </div>
  );
}
