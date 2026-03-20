// UI Components
import { Button, type ButtonProps } from "@/components/ui/button";

// Form
import { useFormContext } from "@/lib/form/form-context";

interface SubmitButtonProps {
  label?: string;
  loadingLabel?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}

export default function SubmitButton({
  label = "Submit",
  loadingLabel = "Saving...",
  variant = "default",
  size = "default",
  className,
}: SubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(s) => ({ isSubmitting: s.isSubmitting, canSubmit: s.canSubmit })}
    >
      {({ isSubmitting, canSubmit }) => (
        <Button
          type="submit"
          variant={variant}
          size={size}
          className={className}
          disabled={!canSubmit || isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting ? loadingLabel : label}
        </Button>
      )}
    </form.Subscribe>
  );
}
