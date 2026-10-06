// React
import { Suspense, useState } from "react";

// Query
import { useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";

// Form
import { useAppForm } from "@/lib/form/form-context";

// Feature Queries
import { agencyKeys, useCreateAgency, useMyAgency, useUpdateAgency } from "@/features/agencies/queries";
import { onboardingKeys } from "@/features/onboarding/queries";

// Types
import type { Agency } from "@/features/agencies/types";

// Utils
import { extractApiError } from "@/lib/api-error";
import {
  isValidPhone,
  normalizePhoneToE164,
  PHONE_INVALID_MESSAGE,
} from "@/lib/phone";
import { useAuthStore } from "@/lib/auth-store";

// Feature Components
import { applyServerFieldErrors } from "./apply-server-errors";

interface AgencyStepProps {
  /** When true the form loads the existing agency and PATCHes instead of POSTing. */
  isEdit: boolean;
  /** Called after a successful save in edit mode (returns the user to the flow). */
  onAfterSave?: () => void;
}

/** Full URL with scheme; the API rejects bare domains. */
const URL_PATTERN = /^https?:\/\/[^\s]+\.[^\s]+/i;

export function AgencyStep({ isEdit, onAfterSave }: AgencyStepProps) {
  const agencyQuery = useMyAgency({ enabled: isEdit });

  // Edit mode must wait for the real values: mounting the form with empty
  // defaults would wipe them (TanStack Form reads defaultValues once).
  if (isEdit && agencyQuery.isPending) {
    return <AgencyFormSkeleton />;
  }

  return (
    <AgencyStepForm
      key={agencyQuery.data?.id ?? "create"}
      isEdit={isEdit}
      agency={isEdit ? agencyQuery.data : undefined}
      onAfterSave={onAfterSave}
    />
  );
}

interface AgencyStepFormProps {
  isEdit: boolean;
  agency?: Agency;
  onAfterSave?: () => void;
}

function AgencyStepForm({ isEdit, agency, onAfterSave }: AgencyStepFormProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const createAgency = useCreateAgency();
  const updateAgency = useUpdateAgency();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isSaving = createAgency.isPending || updateAgency.isPending;

  const form = useAppForm({
    defaultValues: {
      legal_name: agency?.legal_name ?? "",
      display_name: agency?.display_name ?? "",
      email: agency?.email ?? user?.email ?? "",
      // Seed the dial code so typing continues after "+91" instead of the
      // phone input re-detecting a country from the first typed digits
      // (e.g. "98..." matching Iran's +98).
      phone: agency?.phone ? agency.phone.replace(/^\+/, "") : "91",
      website_url: agency?.website_url ?? "",
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);

      const website = value.website_url.trim();
      // The API validates website_url as a full URL whenever the key is
      // present and has no way to unset it (docs/api/agency-api.md §5.3), so
      // an empty value must omit the field rather than send "".
      const payload = {
        legal_name: value.legal_name.trim(),
        display_name: value.display_name.trim(),
        email: value.email.trim(),
        phone: normalizePhoneToE164(value.phone),
        ...(website
          ? {
              website_url: /^https?:\/\//i.test(website)
                ? website
                : `https://${website}`,
            }
          : {}),
      };

      try {
        if (isEdit && agency) {
          // PATCH /agency/me wants only the fields that changed. Names are
          // stored uppercased by the server, so compare them caselessly.
          const original = {
            legal_name: agency.legal_name.toLowerCase(),
            display_name: agency.display_name.toLowerCase(),
            email: agency.email ?? "",
            phone: agency.phone ?? "",
            website_url: agency.website_url ?? "",
          };
          const changes = Object.fromEntries(
            Object.entries(payload).filter(([key, next]) => {
              const prev = original[key as keyof typeof original];
              if (key === "legal_name" || key === "display_name") {
                return String(next).trim().toLowerCase() !== prev;
              }
              return next !== prev;
            })
          ) as Partial<typeof payload>;

          if (Object.keys(changes).length === 0) {
            onAfterSave?.();
            return;
          }
          await updateAgency.mutateAsync(changes);
          onAfterSave?.();
          return;
        }

        await createAgency.mutateAsync(payload);
        // The wizard renders off the status endpoint's next_step, so it must
        // be refetched for the flow to advance on its own.
        await queryClient.invalidateQueries({ queryKey: onboardingKeys.status() });
      } catch (error) {
        const info = extractApiError(error);
        if (info.code === "AGENCY_ALREADY_EXISTS") {
          // Not an error state (docs/api/agency-api.md §5.1): the user
          // resumed the wizard or already finished. Hydrate the record and
          // let the status endpoint drive the next screen.
          toast.info("You already have an agency. Continuing where you left off.");
          await queryClient.invalidateQueries({ queryKey: agencyKeys.me() });
          await queryClient.invalidateQueries({ queryKey: onboardingKeys.status() });
          onAfterSave?.();
          return;
        }
        if (info.code === "VALIDATION_ERROR" && info.fieldErrors.length > 0) {
          applyServerFieldErrors<typeof form.state.values>(
            info.fieldErrors,
            (field, updater) => form.setFieldMeta(field, updater)
          );
          return;
        }
        setSubmitError(info.message);
      }
    },
  });

  return (
    <form.AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-8"
      >
        <Suspense fallback={null}>
          <div className="grid gap-6 sm:grid-cols-2">
            <form.AppField
              name="legal_name"
              validators={{
                onBlur: ({ value }) => {
                  if (!value.trim()) return "Legal name is required";
                  if (value.trim().length < 2)
                    return "Legal name must be at least 2 characters";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <field.InputField
                  label="Legal name"
                  placeholder="TravelSpeed Holidays Private Limited"
                  required
                  autoFocus
                  disabled={isSaving}
                  className="sm:col-span-2"
                />
              )}
            </form.AppField>

            <form.AppField
              name="display_name"
              validators={{
                onBlur: ({ value }) => {
                  if (!value.trim()) return "Display name is required";
                  if (value.trim().length < 2)
                    return "Display name must be at least 2 characters";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <field.InputField
                  label="Display name"
                  placeholder="TravelSpeed"
                  required
                  disabled={isSaving}
                />
              )}
            </form.AppField>

            <form.AppField
              name="phone"
              validators={{
                onBlur: ({ value }) => {
                  if (!value) return "Phone number is required";
                  if (!isValidPhone(value)) return PHONE_INVALID_MESSAGE;
                  return undefined;
                },
              }}
            >
              {(field) => (
                <field.PhoneField label="Phone number" required size="lg" disabled={isSaving} />
              )}
            </form.AppField>

            <form.AppField
              name="email"
              validators={{
                onBlur: ({ value }) => {
                  if (!value.trim()) return "Email is required";
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
                    return "Please enter a valid email";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <field.InputField
                  label="Email"
                  type="email"
                  placeholder="hello@travelspeed.in"
                  required
                  disabled={isSaving}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              )}
            </form.AppField>

            <form.AppField
              name="website_url"
              validators={{
                onBlur: ({ value }) => {
                  const site = value.trim();
                  if (!site) return undefined;
                  if (!URL_PATTERN.test(site.startsWith("http") ? site : `https://${site}`))
                    return "Enter a valid website, e.g. travelspeed.in";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <field.InputField
                  label="Website"
                  placeholder="travelspeed.in"
                  disabled={isSaving}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              )}
            </form.AppField>
          </div>

          {submitError && (
            <p role="alert" className="text-sm text-destructive">
              {submitError}
            </p>
          )}

          {/* Form Actions */}
          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            {isEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={onAfterSave}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            )}
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  loading={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isEdit ? "Save changes" : "Create agency"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </Suspense>
      </form>
    </form.AppForm>
  );
}

function AgencyFormSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid gap-6 sm:grid-cols-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={i === 0 ? "space-y-2 sm:col-span-2" : "space-y-2"}>
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-9.5 rounded-lg bg-muted" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 border-t pt-6">
        <div className="h-9 w-28 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
