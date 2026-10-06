// React
import { useEffect, useState } from "react";
import { usePrevious } from "./use-previous";

// Router
import { useNavigate } from "@tanstack/react-router";

// Motion
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

// Icons
import {
  ClockIcon,
  LogOutIcon,
  PencilIcon,
  RefreshCcwIcon,
  TriangleAlertIcon,
} from "lucide-react";

// Feature Queries
import { useOnboardingStatus } from "@/features/onboarding/queries";
import { useLogout } from "@/features/auth/queries";

// Feature Components
import { AgencyStep } from "./components/AgencyStep";
import { FinishStep } from "./components/FinishStep";
import { LocationStep } from "./components/LocationStep";
import { StepRail, type RailStep } from "./components/StepRail";

// Utils
import { useAuthStore } from "@/lib/auth-store";

type FlowStep = "agency" | "location" | "done";

const STEP_ORDER: FlowStep[] = ["agency", "location", "done"];

const STEP_META: Record<FlowStep, { eyebrow: string; title: string; description: string }> = {
  agency: {
    eyebrow: "Step 1 of 2",
    title: "Tell us about your agency",
    description:
      "This is the business profile your customers will see on quotes, invoices and documents.",
  },
  location: {
    eyebrow: "Step 2 of 2",
    title: "Add your first location",
    description:
      "At least one office is needed so orders, documents and currency have a home. You can add more branches any time.",
  },
  done: {
    eyebrow: "Last step",
    title: "Welcome aboard",
    description: "Review what you created. Everything can be fine-tuned later in Settings.",
  },
};

// Direction-aware step swap: forward slides in from the right, back from
// the left, so the wizard reads like one continuous surface.
const STEP_VARIANTS = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 28 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -28 }),
};

export function OnboardingPage() {
  const status = useOnboardingStatus();
  const navigate = useNavigate();
  const logout = useLogout();
  const user = useAuthStore((s) => s.user);
  const reducedMotion = useReducedMotion();

  // "Back" support: the agency step stays reachable for review after it has
  // been created, without re-entering the flow server-side. Review mode ends
  // whenever the status endpoint reports a new step (render-time reset).
  const [showAgencyReview, setShowAgencyReview] = useState(false);

  const data = status.data;
  const flowStep: FlowStep = data?.next_step ?? "agency";
  const [prevNextStep, setPrevNextStep] = useState(flowStep);
  if (prevNextStep !== flowStep) {
    setPrevNextStep(flowStep);
    setShowAgencyReview(false);
  }

  // Warm the geo dataset in the background while the user fills in the
  // agency step, so the location step's pickers are ready when reached.
  useEffect(() => {
    void import("@/lib/geo").then((geo) => geo.getCountryOptions());
  }, []);
  const effectiveStep: FlowStep =
    showAgencyReview && data?.steps.agency_created ? "agency" : flowStep;
  const stepIndex = STEP_ORDER.indexOf(effectiveStep);
  const prevIndex = usePrevious(stepIndex) ?? stepIndex;
  const direction = stepIndex >= prevIndex ? 1 : -1;

  const railSteps: RailStep[] = STEP_ORDER.map((id, index) => {
    const label =
      id === "agency" ? "Agency" : id === "location" ? "Location" : "Finish";
    const hint =
      id === "agency"
        ? "Business profile"
        : id === "location"
          ? "First office"
          : "Review and launch";
    const state =
      id === "done"
        ? data?.onboarding_completed
          ? "complete"
          : stepIndex === 2
            ? "current"
            : "upcoming"
        : index < stepIndex
          ? "complete"
          : index === stepIndex
            ? "current"
            : "upcoming";
    return { id, number: index + 1, label, hint, state, interactive: id === "agency" };
  });

  // The rail is wayfinding, not decoration: a completed agency step can be
  // reopened for review from anywhere in the wizard. (Locations have no
  // review surface yet, so their node never lights up as clickable.)
  const handleStepClick = (id: string) => {
    if (id === "agency" && data?.steps.agency_created) {
      setShowAgencyReview(true);
    }
  };

  const handleSignOut = () => {
    const refresh_token = useAuthStore.getState().refresh_token ?? "";
    logout.mutate(
      { refresh_token },
      { onSettled: () => navigate({ to: "/auth/login", replace: true }) }
    );
  };

  // Reviewing an earlier step is not the same as being on it: the eyebrow
  // says so, keeping the "where am I?" answer honest.
  const meta = showAgencyReview
    ? { ...STEP_META.agency, eyebrow: "Reviewing step 1 of 2" }
    : STEP_META[effectiveStep];

  return (
    <div className="flex min-h-dvh flex-col bg-background lg:h-dvh lg:overflow-hidden">
      {/* Top bar: brand + a way out (wayfinding: never trap the user).
          With viewport-fit=cover the status bar/dynamic island sits over the
          page, so the header pads below env(safe-area-inset-top). */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-background/85 px-5 pt-[calc(0.875rem+env(safe-area-inset-top,0px))] pb-3.5 backdrop-blur-md sm:px-8">
        <Logo className="h-7" />
        <div className="flex min-w-0 items-center gap-3 text-sm text-muted-foreground">
          <span className="hidden min-w-0 truncate sm:block">
            Signed in as{" "}
            <span className="font-medium text-foreground">{user?.email}</span>
          </span>
          <span className="hidden sm:block" aria-hidden="true">
            ·
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={logout.isPending}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 font-medium text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground active:bg-accent active:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-64"
          >
            <LogOutIcon className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </header>

      {/* Bottom padding clears the home indicator so the form's action row
          never ends up under it when scrolled to the end. */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] sm:px-8 sm:pt-12 sm:pb-12 lg:min-h-0">
        {/* Compact rail on mobile */}
        <StepRail
          steps={railSteps}
          orientation="horizontal"
          onStepClick={handleStepClick}
          className="mb-8 lg:hidden"
        />

        <div className="grid flex-1 gap-12 lg:min-h-0 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-14">
          {/* Rail + reassurance on desktop: fixed while the step column scrolls */}
          <aside className="hidden lg:block">
            <StepRail steps={railSteps} orientation="vertical" />
            <div className="mt-4 space-y-4 border-t pt-6">
              <p className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <ClockIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Takes about a minute. Your progress is saved as you go, so you
                can leave and come back.
              </p>
              <p className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <PencilIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Nothing here is locked in. Every detail stays editable in
                Settings afterwards.
              </p>
            </div>
          </aside>

          {/* Step content: on desktop this panel is the scroll container.
              Being the keyed element, every step mounts scrolled to the top. */}
          <section className="min-w-0 lg:min-h-0">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={`${effectiveStep}${showAgencyReview ? "-review" : ""}`}
                custom={direction}
                variants={STEP_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={
                  reducedMotion
                    ? { duration: 0.15, ease: "easeOut" }
                    : { type: "spring", duration: 0.4, bounce: 0 }
                }
                className="step-scroll space-y-8 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pr-3"
              >
                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {meta.eyebrow}
                  </p>
                  <h1 className="font-heading text-2xl font-semibold tracking-tight">
                    {meta.title}
                  </h1>
                  <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
                    {meta.description}
                  </p>
                </div>

                {/* No card around the form: the wizard is one continuous
                    flow, hierarchy comes from type, spacing and dividers.
                    Fields share the title's left edge. */}
                <div>
                  {status.isPending ? (
                    <OnboardingSkeleton />
                  ) : status.isError ? (
                    <StatusError onRetry={() => void status.refetch()} />
                  ) : effectiveStep === "agency" ? (
                    <AgencyStep
                      isEdit={!!data?.steps.agency_created}
                      onAfterSave={() => setShowAgencyReview(false)}
                    />
                  ) : effectiveStep === "location" ? (
                    <LocationStep
                      canGoBack={!!data?.steps.agency_created}
                      onBack={() => setShowAgencyReview(true)}
                    />
                  ) : (
                    <FinishStep />
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </main>
    </div>
  );
}

function OnboardingSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="h-9.5 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      ))}
      <div className="flex justify-end border-t pt-6">
        <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}

function StatusError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-warning/15 text-warning-foreground">
        <TriangleAlertIcon className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="font-medium">We couldn't load your setup progress</p>
        <p className="text-sm text-muted-foreground">
          Check your connection and try again. Your work so far is safe.
        </p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCcwIcon aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
