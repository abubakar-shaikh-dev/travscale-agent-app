// React
import { useEffect, useRef, type ReactNode } from "react";

// UI Components
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// Hooks
import { useMediaQuery } from "@/hooks/use-media-query";

// Utils
import { cn } from "@/lib/utils";

interface AuthStateButtonProps {
  /** Idle content: a label, optionally with a leading icon. */
  children: ReactNode;
  loadingLabel: string;
  successLabel: string;
  loading: boolean;
  isSuccess: boolean;
  /**
   * Fired once, after the success state has been held long enough to read.
   * The hold also gives the router context time to refresh before the
   * caller navigates and route guards re-evaluate.
   */
  onSuccessComplete: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
}

// Length of the tick path "M5 13l4 4L19 7": used for the stroke-dash draw.
const TICK_PATH_LENGTH = 24;

/**
 * Shared three-state button for auth flows: idle content, a loading overlay
 * (spinner + label), and a success overlay (drawn tick + label) that holds
 * before notifying. Presentational on purpose: forms wrap it to wire
 * TanStack Form state, standalone buttons (Google) drive it directly.
 */
export default function AuthStateButton({
  children,
  loadingLabel,
  successLabel,
  loading,
  isSuccess,
  onSuccessComplete,
  disabled,
  type = "button",
  onClick,
  className,
}: AuthStateButtonProps) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Hold the latest callback in a ref so a parent re-render during the hold
  // cannot cancel the pending navigation timer.
  const onCompleteRef = useRef(onSuccessComplete);
  useEffect(() => {
    onCompleteRef.current = onSuccessComplete;
  });

  // Once success fires, hold the success state long enough to read, then notify.
  useEffect(() => {
    if (!isSuccess) return;
    const holdMs = reducedMotion ? 500 : 1100;
    const t = setTimeout(() => onCompleteRef.current(), holdMs);
    return () => clearTimeout(t);
  }, [isSuccess, reducedMotion]);

  const isDisabled = disabled || isSuccess;

  return (
    <Button
      type={type}
      onClick={onClick}
      // `loading={false}` so Button doesn't render its own spinner or hide our
      // children: we orchestrate the three states ourselves.
      loading={false}
      disabled={isDisabled}
      className={cn(
        // Keep the button at full opacity during loading + success
        // (Button's default `disabled:opacity-64` would dim it).
        "relative w-full disabled:opacity-100",
        "transition-[color,transform] duration-200 ease-out active:scale-[0.97]",
        isSuccess && "border-success bg-success text-white hover:bg-success",
        className,
      )}
    >
      {/* Idle content */}
      <span
        className={cn(
          "flex items-center justify-center gap-2 transition-[opacity,transform] duration-150 ease-out",
          loading || isSuccess ? "scale-95 opacity-0" : "scale-100 opacity-100",
        )}
        aria-hidden={loading || isSuccess || undefined}
      >
        {children}
      </span>

      {/* Loading overlay: spinner + loading label */}
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center gap-2 transition-[opacity,transform] duration-150 ease-out",
          loading && !isSuccess ? "scale-100 opacity-100" : "scale-95 opacity-0",
        )}
        aria-hidden={!loading || isSuccess || undefined}
      >
        <Spinner className="size-4" />
        <span>{loadingLabel}</span>
      </span>

      {/* Success overlay: animated tick + success label */}
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center gap-2 transition-[opacity,transform] duration-200 ease-out",
          isSuccess ? "scale-100 opacity-100" : "scale-95 opacity-0",
        )}
        aria-live="polite"
        aria-hidden={!isSuccess || undefined}
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
              strokeDashoffset: isSuccess ? 0 : TICK_PATH_LENGTH,
              transition: reducedMotion
                ? "none"
                : `stroke-dashoffset 460ms var(--motion-ease-out) 80ms`,
            }}
          />
        </svg>
        <span>{successLabel}</span>
      </span>
    </Button>
  );
}
