// React
import { useId } from "react";

// UI Components
import { Label } from "@/components/ui/label";

// Phone Input
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Form
import { useFieldContext } from "@/lib/form/form-context";

// Utils
import { cn } from "@/lib/utils";

interface PhoneFieldProps {
  label: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Default country code (ISO 3166-1 alpha-2). Defaults to India (in). */
  country?: string;
}

export default function PhoneField({
  label,
  placeholder = "Enter phone number",
  disabled,
  className,
  country = "in",
}: PhoneFieldProps) {
  const field = useFieldContext<string>();
  const inputId = useId();

  const errors = field.state.meta.errors;
  const hasError = errors.length > 0 && field.state.meta.isTouched;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={inputId}>{label}</Label>
      <PhoneInput
        inputProps={{
          id: inputId,
          name: field.name,
        }}
        country={country}
        value={field.state.value ?? ""}
        onChange={(value) => field.handleChange(value)}
        onBlur={field.handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        // Enable search in dropdown
        enableSearch
        searchPlaceholder="Search country..."
        searchNotFound="No country found"
        // Prioritize commonly used countries
        preferredCountries={["in", "us", "gb", "ae", "sa"]}
        containerClass={cn(
          "phone-input-container",
          hasError && "phone-input-error"
        )}
        inputClass="phone-input-field"
        buttonClass="phone-input-button"
        dropdownClass="phone-input-dropdown"
        searchClass="phone-input-search"
      />
      {hasError && (
        <p className="text-sm text-destructive" role="alert">
          {errors.map((e) => (e as { message?: string }).message ?? e).join(", ")}
        </p>
      )}
    </div>
  );
}
