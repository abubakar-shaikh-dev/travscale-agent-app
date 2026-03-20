// React
import { type ReactNode } from "react";

// UI Components
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Hooks
import { useFieldContext } from "@/lib/form/form-context";

// Utils
import { cn } from "@/lib/utils";

interface CheckboxGroupFieldProps {
  label: string;
  options: {
    label: string;
    value: string;
    icon?: ReactNode;
  }[];
  description?: string;
  columns?: 1 | 2 | 3;
}

export default function CheckboxGroupField({
  label,
  options,
  description,
  columns = 1,
}: CheckboxGroupFieldProps) {
  const field = useFieldContext<string[]>();

  const errors = field.state.meta.errors;
  const hasError = errors.length > 0 && field.state.meta.isTouched;

  const handleToggle = (value: string) => {
    const currentValues = field.state.value || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    field.handleChange(newValues);
  };

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className={cn("grid gap-3", gridCols[columns])}>
        {options.map((option) => {
          const isChecked = (field.state.value || []).includes(option.value);

          return (
            <div
              key={option.value}
              className={cn(
                "flex items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
                isChecked && "bg-muted",
                hasError && "border-destructive",
              )}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => handleToggle(option.value)}
                id={`${field.name}-${option.value}`}
              />
              <div className="flex items-center gap-2 flex-1">
                {option.icon && <div className="shrink-0">{option.icon}</div>}
                <Label
                  htmlFor={`${field.name}-${option.value}`}
                  className="cursor-pointer font-medium"
                >
                  {option.label}
                </Label>
              </div>
            </div>
          );
        })}
      </div>

      {hasError && (
        <p className="text-sm text-destructive" role="alert">
          {errors.join(", ")}
        </p>
      )}
    </div>
  );
}
