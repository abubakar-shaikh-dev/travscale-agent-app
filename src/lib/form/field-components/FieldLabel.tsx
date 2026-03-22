// UI Components
import { Label } from "@/components/ui/label";

// Utils
import { cn } from "@/lib/utils";

interface FieldLabelProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}

export function FieldLabel({
  label,
  htmlFor,
  required = false,
  className,
}: FieldLabelProps) {
  return (
    <Label htmlFor={htmlFor} className={cn("inline-flex items-center", className)}>
      <span>{label}</span>
      {required ? (
        <>
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
          <span className="sr-only"> required</span>
        </>
      ) : null}
    </Label>
  );
}
