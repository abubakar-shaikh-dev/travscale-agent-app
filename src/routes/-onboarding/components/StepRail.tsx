// Motion
import { motion } from "framer-motion";

// Utils
import { cn } from "@/lib/utils";

export type RailStepState = "complete" | "current" | "upcoming";

export interface RailStep {
  id: string;
  /** 1-based position shown inside incomplete nodes. */
  number: number;
  label: string;
  hint?: string;
  state: RailStepState;
  /** Completed steps the user can actually revisit light up as clickable. */
  interactive?: boolean;
}

interface StepRailProps {
  steps: RailStep[];
  orientation?: "vertical" | "horizontal";
  /** Click handler for completed, interactive steps. */
  onStepClick?: (id: string) => void;
  className?: string;
}

/**
 * The onboarding progress rail. Completed nodes turn into drawn checkmarks,
 * the connector fills with a spring, and completed interactive steps become
 * one large clickable row so a resumed user can review them.
 */
export function StepRail({
  steps,
  orientation = "vertical",
  onStepClick,
  className,
}: StepRailProps) {
  if (orientation === "horizontal") {
    return (
      <ol className={cn("flex items-start", className)}>
        {steps.map((step, index) => {
          const next = steps[index + 1];
          const clickable = isClickable(step, onStepClick);
          const body = (
            <div className="flex min-w-14 flex-col items-center gap-1.5">
              <RailNode step={step} />
              {/* Hints are desktop-rail furniture: on the compact mobile rail
                  only the labels carry meaning. */}
              <RailLabel step={step} className="text-center" showHint={false} />
            </div>
          );
          return (
            <li key={step.id} className="contents">
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick?.(step.id)}
                  className="-mx-1 cursor-pointer rounded-md px-1 text-left outline-none transition-colors duration-150 ease-out hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {body}
                </button>
              ) : (
                body
              )}
              {next && (
                <RailConnector
                  active={next.state === "complete"}
                  orientation="horizontal"
                />
              )}
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className={cn("flex flex-col", className)}>
      {steps.map((step, index) => {
        const next = steps[index + 1];
        const clickable = isClickable(step, onStepClick);
        const body = (
          <>
            <div className="flex flex-col items-center">
              <RailNode step={step} />
              {next && (
                <RailConnector
                  active={next.state === "complete"}
                  orientation="vertical"
                />
              )}
            </div>
            <RailLabel step={step} className="pb-7 pt-1" />
          </>
        );
        return (
          <li key={step.id} className="grid grid-cols-[auto_1fr] gap-x-3.5">
            {clickable ? (
              // One row-sized target: node, connector and label all belong
              // to the same "review this step" action.
              <button
                type="button"
                onClick={() => onStepClick?.(step.id)}
                className="col-span-2 -mx-2 grid cursor-pointer grid-cols-[auto_1fr] gap-x-3.5 rounded-md px-2 text-left outline-none transition-colors duration-150 ease-out hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
              >
                {body}
              </button>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ol>
  );
}

function isClickable(
  step: RailStep,
  onStepClick: ((id: string) => void) | undefined
): boolean {
  return step.state === "complete" && step.interactive !== false && !!onStepClick;
}

/**
 * The line between two nodes: fills once the following step is complete.
 * A spring (not a duration curve) so rapid step changes retarget smoothly.
 */
function RailConnector({
  active,
  orientation,
}: {
  active: boolean;
  orientation: "vertical" | "horizontal";
}) {
  if (orientation === "horizontal") {
    return (
      <span
        aria-hidden="true"
        className="relative mx-1.5 mt-3.5 h-px min-w-4 flex-1 self-start overflow-hidden bg-border"
      >
        <motion.span
          className="absolute inset-y-0 left-0 bg-primary"
          initial={false}
          animate={{ width: active ? "100%" : "0%" }}
          transition={{ type: "spring", duration: 0.5, bounce: 0 }}
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="relative my-1.5 w-px flex-1 overflow-hidden bg-border"
    >
      <motion.span
        className="absolute inset-x-0 top-0 bg-primary"
        initial={false}
        animate={{ height: active ? "100%" : "0%" }}
        transition={{ type: "spring", duration: 0.5, bounce: 0 }}
      />
    </span>
  );
}

function RailNode({ step }: { step: RailStep }) {
  return (
    <span
      className={cn(
        "relative flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors duration-200",
        step.state === "complete" &&
          "border-primary bg-primary text-primary-foreground",
        step.state === "current" &&
          "border-primary bg-primary text-primary-foreground ring-4 ring-primary/15",
        step.state === "upcoming" &&
          "border-border bg-background text-muted-foreground",
      )}
      aria-current={step.state === "current" ? "step" : undefined}
    >
      {step.state === "current" && (
        <span
          className="node-ping-ring absolute inset-0 rounded-full bg-primary/20"
          aria-hidden="true"
        />
      )}
      {step.state === "complete" ? (
        <svg
          viewBox="0 0 24 24"
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12.5 10 18 19 6.5" className="auth-draw" />
        </svg>
      ) : (
        <span aria-hidden="true">{step.number}</span>
      )}
    </span>
  );
}

function RailLabel({
  step,
  className,
  showHint = true,
}: {
  step: RailStep;
  className?: string;
  showHint?: boolean;
}) {
  const reviewable = step.state === "complete";

  return (
    <div className={cn("min-w-0", className)}>
      <span
        className={cn(
          "block text-sm font-medium leading-5",
          step.state === "upcoming" ? "text-muted-foreground" : "text-foreground",
          reviewable &&
            "underline-offset-2 group-hover:underline",
        )}
      >
        {step.label}
      </span>
      {showHint && step.hint && (
        <span className="mt-0.5 block text-xs leading-4 text-muted-foreground/80">
          {step.hint}
        </span>
      )}
    </div>
  );
}
