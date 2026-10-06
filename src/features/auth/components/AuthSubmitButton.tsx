// Form
import { useFormContext } from "@/lib/form/form-context";

// Feature Components
import AuthStateButton from "./AuthStateButton";

interface AuthSubmitButtonProps {
  label: string;
  loadingLabel: string;
  successLabel: string;
  isSuccess: boolean;
  onSuccessComplete: () => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Form-coupled submit button: reads TanStack Form's submitting/canSubmit
 * state and renders the shared idle/loading/success button underneath.
 * All visuals and the success hold live in AuthStateButton.
 */
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

  return (
    <form.Subscribe
      selector={(s) => ({
        isSubmitting: s.isSubmitting,
        canSubmit: s.canSubmit,
      })}
    >
      {({ isSubmitting, canSubmit }) => (
        <AuthStateButton
          type="submit"
          loading={isSubmitting}
          isSuccess={isSuccess}
          onSuccessComplete={onSuccessComplete}
          disabled={!canSubmit || isSubmitting || disabled}
          loadingLabel={loadingLabel}
          successLabel={successLabel}
          className={className}
        >
          {label}
        </AuthStateButton>
      )}
    </form.Subscribe>
  );
}
