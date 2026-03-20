// React
import type { ReactNode } from "react";

// UI Components
import { Label } from "@/components/ui/label";

// Form
import { useFieldContext } from "@/lib/form/form-context";

// Utils
import { cn } from "@/lib/utils";

interface RadioCardOption {
  label: string;
  value: string;
  icon: ReactNode;
  description?: string;
}

interface RadioCardFieldProps {
  label: string;
  options: RadioCardOption[];
  disabled?: boolean;
  className?: string;
  columns?: 2 | 3 | 4;
}

export default function RadioCardField({
  label,
  options,
  disabled,
  className,
  columns = 2,
}: RadioCardFieldProps) {
  const field = useFieldContext<string>();

  const errors = field.state.meta.errors;
  const hasError = errors.length > 0 && field.state.meta.isTouched;

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <div
        className={cn("grid gap-2", gridCols[columns])}
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => {
          const isSelected = field.state.value === option.value;

          return (
            <label
              key={option.value}
              className={cn(
                "group relative flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-all",
                "hover:bg-accent/40",
                "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-input bg-background",
                hasError && !isSelected && "border-destructive/40",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <input
                type="radio"
                name={field.name}
                value={option.value}
                checked={isSelected}
                onChange={() => field.handleChange(option.value)}
                onBlur={field.handleBlur}
                disabled={disabled}
                className="sr-only"
              />

              {/* Icon - minimal style */}
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-accent"
                )}
              >
                {option.icon}
              </div>

              {/* Label and description */}
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isSelected ? "text-foreground" : "text-foreground/80"
                  )}
                >
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </div>

              {/* Selected indicator - subtle checkmark */}
              {isSelected && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="size-4 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </label>
          );
        })}
      </div>
      {hasError && (
        <p className="text-sm text-destructive" role="alert">
          {errors.map((e) => (e as { message?: string }).message ?? e).join(", ")}
        </p>
      )}
    </div>
  );
}
