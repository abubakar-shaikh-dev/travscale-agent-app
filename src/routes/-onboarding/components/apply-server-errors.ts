// Form
import type {
  AnyFieldLikeMetaBase,
  DeepKeys,
  Updater,
} from "@tanstack/react-form";

// Types
import type { ApiFieldError } from "@/lib/api-error";

// Utils
import { toFormFieldErrors } from "@/lib/api-error";

/**
 * Map `400 VALIDATION_ERROR` details onto form fields: each message becomes
 * the field's error (rendered by the field components) and the field is
 * marked touched so the error shows immediately, mirroring what the onBlur
 * validators produce.
 *
 * Takes the form's setFieldMeta as a callback so the caller's form instance
 * keeps its exact field-name typing:
 *   applyServerFieldErrors<typeof form.state.values>(errors, (field, updater) =>
 *     form.setFieldMeta(field, updater)
 *   );
 *
 * Returns whether at least one known field received an error, so callers can
 * fall back to a form-level message when the server rejected something the
 * form does not render.
 */
export function applyServerFieldErrors<
  TValues extends Record<string, unknown>,
>(
  fieldErrors: ApiFieldError[],
  setFieldMeta: (
    field: DeepKeys<TValues>,
    updater: Updater<AnyFieldLikeMetaBase>
  ) => void
): boolean {
  const map = toFormFieldErrors(fieldErrors);
  const names = Object.keys(map) as DeepKeys<TValues>[];

  for (const name of names) {
    setFieldMeta(name, (prev) => ({
      ...prev,
      errors: [map[name]],
      isTouched: true,
    }));
  }
  return names.length > 0;
}
