// React
import { useState } from "react";

// UI Components
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

// Icons
import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";

// Form Components
import { FieldLabel } from "./FieldLabel";

// Form
import { useFieldContext } from "@/lib/form/form-context";

// Utils
import { cn } from "@/lib/utils";

interface PasswordFieldProps {
  label: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  /** Hint text rendered under the input (e.g. password requirements). */
  hint?: string;
}

export default function PasswordField({
  label,
  placeholder,
  disabled,
  className,
  required = false,
  hint,
}: PasswordFieldProps) {
  const field = useFieldContext<string>();
  const [show, setShow] = useState(false);

  const errors = field.state.meta.errors;
  const hasError = errors.length > 0 && field.state.meta.isTouched;

  return (
    <div className={cn("space-y-2", className)}>
      <FieldLabel label={label} htmlFor={field.name} required={required} />
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <LockIcon />
        </InputGroupAddon>
        <InputGroupInput
          id={field.name}
          name={field.name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={field.state.value ?? ""}
          disabled={disabled}
          aria-invalid={hasError}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
        />
        <InputGroupAddon align="inline-end">
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </InputGroupAddon>
      </InputGroup>
      {hint && !hasError ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {hasError && (
        <p className="text-sm text-destructive" role="alert">
          {errors
            .map((e) => (e as { message?: string }).message ?? e)
            .join(", ")}
        </p>
      )}
    </div>
  );
}
