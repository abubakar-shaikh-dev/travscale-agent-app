// UI Components
import { Input } from "@/components/ui/input";

// Form Components
import { FieldLabel } from "./FieldLabel";

// Form
import { useFieldContext } from "@/lib/form/form-context";

// Utils
import { cn } from "@/lib/utils";

interface InputFieldProps {
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "url" | "password";
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export default function InputField({
  label,
  placeholder,
  type = "text",
  disabled,
  className,
  required = false,
}: InputFieldProps) {
  const field = useFieldContext<string>();

  const errors = field.state.meta.errors;
  const hasError = errors.length > 0 && field.state.meta.isTouched;

  return (
    <div className={cn("space-y-2", className)}>
      <FieldLabel label={label} htmlFor={field.name} required={required} />
      <Input
        id={field.name}
        name={field.name}
        type={type}
        placeholder={placeholder}
        value={field.state.value ?? ""}
        disabled={disabled}
        aria-invalid={hasError}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        size="lg"
        className="rounded-md"
      />
      {hasError && (
        <p className="text-sm text-destructive" role="alert">
          {errors.map((e) => (e as { message?: string }).message ?? e).join(", ")}
        </p>
      )}
    </div>
  );
}
