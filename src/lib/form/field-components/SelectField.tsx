// UI Components
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form Components
import { FieldLabel } from "./FieldLabel";

// Form
import { useFieldContext } from "@/lib/form/form-context";

// Utils
import { cn } from "@/lib/utils";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label: string;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export default function SelectField({
  label,
  placeholder = "Select an option",
  options,
  disabled,
  className,
  required = false,
}: SelectFieldProps) {
  const field = useFieldContext<string>();

  const errors = field.state.meta.errors;
  const hasError = errors.length > 0 && field.state.meta.isTouched;

  return (
    <div className={cn("space-y-1.5", className)}>
      <FieldLabel label={label} htmlFor={field.name} required={required} />
      <Select
        value={field.state.value ?? ""}
        onValueChange={(value) => field.handleChange(value ?? "")}
        disabled={disabled}
      >
        <SelectTrigger
          id={field.name}
          aria-invalid={hasError}
          onBlur={field.handleBlur}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectPopup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
      {hasError && (
        <p className="text-sm text-destructive" role="alert">
          {errors.map((e) => (e as { message?: string }).message ?? e).join(", ")}
        </p>
      )}
    </div>
  );
}
