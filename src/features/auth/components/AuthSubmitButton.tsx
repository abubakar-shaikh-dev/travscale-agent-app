// React
import { useEffect, useRef, useState } from "react";

// UI Components
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// Form
import { useFormContext } from "@/lib/form/form-context";

// Utils
import { cn } from "@/lib/utils";

interface AuthSubmitButtonProps {
  label: string;
  loadingLabel: string;
  successLabel: string;
  isSuccess: boolean;
  onSuccessComplete: () => void;
  className?: string;
  disabled?: boolean;
}

// Length of the tick path "M5 13l4 4L19 7" — used for the stroke-dash draw.
const TICK_PATH_LENGTH = 24;

export default function AuthSubmitButton({
  label,
  loadingLabel,
  successLabel,
  isSuccess,
  onSuccessComplete,
  className,
  disabled,
}: AuthSubmitButtonProps) {
  const form = useFormContext();
  const [reducedMotion, setReducedMotion] = useState(false);
  const completedRef = useRef(false);

  // Respect prefers-reduced-motion: skip the draw animation and shorten the hold.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Once success fires, hold the success state long enough to read, then notify.
  useEffect(() => {
    if (!isSuccess || completedRef.current) return;
    completedRef.current = true;
    const holdMs = reducedMotion ? 500 : 1100;
    const t = setTimeout(onSuccessComplete, holdMs);
    return () => clearTimeout(t);
  }, [isSuccess, reducedMotion, onSuccessComplete]);

  return (
    <form.Subscribe
      selector={(s) => ({
        isSubmitting: s.isSubmitting,
        canSubmit: s.canSubmit,
      })}
    >
      {({ isSubmitting, canSubmit }) => {
        const loading = isSubmitting;
        const showSuccess = isSuccess;
        const isDisabled = !canSubmit || isSubmitting || disabled || showSuccess;

        return (
          <Button
            type="submit"
            // `loading={false}` so Button doesn't render its own spinner or
            // hide our children — we orchestrate the three states ourselves.
            loading={false}
            disabled={isDisabled}
            className={cn(
              // Keep the button at full opacity during loading + success
              // (Button's default `disabled:opacity-64` would dim it).
              "relative w-full disabled:opacity-100",
              "transition-colors duration-200 ease-out",
              showSuccess &&
                "border-success bg-success text-success-foreground hover:bg-success",
              className,
            )}
          >
            {/* Idle label */}
            <span
              className={cn(
                "flex items-center justify-center gap-2 transition-[opacity,transform] duration-150 ease-out",
                loading || showSuccess
                  ? "scale-95 opacity-0"
                  : "scale-100 opacity-100",
              )}
              aria-hidden={loading || showSuccess || undefined}
            >
              {label}
            </span>

            {/* Loading overlay — spinner + loading label */}
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center gap-2 transition-[opacity,transform] duration-150 ease-out",
                loading && !showSuccess
                  ? "scale-100 opacity-100"
                  : "scale-95 opacity-0",
              )}
              aria-hidden={!loading || showSuccess || undefined}
            >
              <Spinner className="size-4" />
              <span>{loadingLabel}</span>
            </span>

            {/* Success overlay — animated tick + success label */}
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center gap-2 transition-[opacity,transform] duration-200 ease-out",
                showSuccess
                  ? "scale-100 opacity-100"
                  : "scale-95 opacity-0",
              )}
              aria-live="polite"
              aria-hidden={!showSuccess || undefined}
            >
              <svg
                viewBox="0 0 24 24"
                className="size-5 shrink-0"
                aria-hidden="true"
                fill="none"
              >
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: TICK_PATH_LENGTH,
                    strokeDashoffset: showSuccess ? 0 : TICK_PATH_LENGTH,
                    transition: reducedMotion
                      ? "none"
                      : `stroke-dashoffset 460ms cubic-bezier(0.23, 1, 0.32, 1) 80ms`,
                  }}
                />
              </svg>
              <span>{successLabel}</span>
            </span>
          </Button>
        );
      }}
    </form.Subscribe>
  );
}
