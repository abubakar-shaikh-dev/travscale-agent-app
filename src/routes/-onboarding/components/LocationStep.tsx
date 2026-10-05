// React
import { Suspense, useRef, useState } from "react";

// Query
import { useQueryClient } from "@tanstack/react-query";

// UI Components
import { Button } from "@/components/ui/button";

// Icons
import { ChevronLeftIcon } from "lucide-react";

// Form
import { useStore } from "@tanstack/react-form";
import { useAppForm } from "@/lib/form/form-context";

// Feature Queries
import { useCreateAgencyLocation } from "@/features/agencies/queries";
import { onboardingKeys } from "@/features/onboarding/queries";

// Types
import type { CreateAgencyLocationPayload } from "@/features/agencies/types";

// Utils
import { extractApiError } from "@/lib/api-error";
import {
  getCityOptionsOfCountry,
  getCityOptionsOfState,
  getCountryCurrency,
  getCountryName,
  getCurrencyOptions,
  getCountryOptions,
  getStateOptions,
} from "@/lib/geo";

// Hooks
import { useAsyncOptions } from "@/hooks/use-async-options";

// Feature Components
import { applyServerFieldErrors } from "./apply-server-errors";

interface LocationStepProps {
  /** Whether the agency step is done (always true when this step shows). */
  canGoBack: boolean;
  onBack?: () => void;
}

/** Turn a location/office name into a short uppercase code suggestion. */
function suggestCode(source: string): string {
  const cleaned = source
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "")
    .slice(0, 10);
  return cleaned.length >= 2 ? cleaned : "";
}

const CODE_PATTERN = /^[A-Z0-9_-]{2,10}$/;

/**
 * The first agency location. The country/state/city trio cascades: changing
 * a parent clears its children, and a child stays disabled until its parent
 * has a value (countries without state data hand their cities straight to
 * the city picker).
 */
export function LocationStep({ canGoBack, onBack }: LocationStepProps) {
  const queryClient = useQueryClient();
  const createLocation = useCreateAgencyLocation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Dirty flags for the smart defaults: auto-suggestions keep flowing until
  // the user commits an edit themselves (blur), then they are left alone.
  const codeTouchedRef = useRef(false);
  const currencyTouchedRef = useRef(false);
  // Guards the async currency suggestion against out-of-order completions
  // when the country changes quickly.
  const currencyRequestRef = useRef(0);

  const form = useAppForm({
    defaultValues: {
      name: "",
      code: "",
      country_code: "",
      state_code: "",
      city: "",
      postal_code: "",
      address_line1: "",
      address_line2: "",
      currency: "INR",
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);

      const payload: CreateAgencyLocationPayload = {
        name: value.name.trim(),
        code: value.code.trim().toUpperCase(),
        country_code: value.country_code,
        city: value.city.trim() || undefined,
        state_code: value.state_code || undefined,
        postal_code: value.postal_code.trim() || undefined,
        address_line1: value.address_line1.trim() || undefined,
        address_line2: value.address_line2.trim() || undefined,
        currency: value.currency,
      };

      try {
        await createLocation.mutateAsync(payload);
        // The wizard renders off the status endpoint's next_step, so it must
        // be refetched for the flow to advance on its own.
        await queryClient.invalidateQueries({ queryKey: onboardingKeys.status() });
      } catch (error) {
        const info = extractApiError(error);
        if (info.code === "AGENCY_LOCATION_CODE_EXISTS") {
          codeTouchedRef.current = true;
          form.setFieldMeta("code", (prev) => ({
            ...prev,
            errors: ["Another location already uses this code"],
            isTouched: true,
          }));
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

  // Subscribe to the two values the cascade derives from: useAppForm does
  // not re-render this component on field-value changes by itself.
  const country = useStore(form.store, (s) => s.values.country_code);
  const state = useStore(form.store, (s) => s.values.state_code);

  // Geo datasets load on demand (they are far too large to ship eagerly).
  // Each key encodes its inputs, so a country change refires the loaders.
  const countryOptions = useAsyncOptions("countries", getCountryOptions);
  const currencyOptions = useAsyncOptions("currencies", getCurrencyOptions);
  const stateOptions = useAsyncOptions(`states:${country}`, () =>
    getStateOptions(country)
  );
  const hasStates = (stateOptions.data?.length ?? 0) > 0;
  const cityOptions = useAsyncOptions(
    `cities:${country}|${state}:${hasStates}`,
    () => {
      if (!country) return Promise.resolve([]);
      if (state) return getCityOptionsOfState(country, state);
      // Countries WITH state data require picking one first.
      return hasStates ? Promise.resolve([]) : getCityOptionsOfCountry(country);
    }
  );
  const countryMeta = useAsyncOptions(`country-meta:${country}`, () =>
    getCountryName(country)
  );
  const countryName = countryMeta.data;

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
              name="name"
              validators={{
                onBlur: ({ value }) => {
                  if (!value.trim()) return "Location name is required";
                  if (value.trim().length > 100)
                    return "Location name must be at most 100 characters";
                  return undefined;
                },
              }}
              listeners={{
                // Auto-suggest the short code from the name until the user
                // commits their own code, then suggestions stop.
                onChange: ({ value: name }) => {
                  if (!codeTouchedRef.current) {
                    form.setFieldValue(
                      "code",
                      suggestCode(name || form.getFieldValue("city"))
                    );
                  }
                },
              }}
            >
              {(field) => (
                <field.InputField
                  label="Location name"
                  placeholder="Mumbai Head Office"
                  required
                  autoFocus
                  disabled={createLocation.isPending}
                  className="sm:col-span-2"
                />
              )}
            </form.AppField>

            <form.AppField
              name="code"
              validators={{
                onBlur: ({ value }) => {
                  if (!value.trim()) return "Location code is required";
                  if (!CODE_PATTERN.test(value.trim().toUpperCase()))
                    return "2 to 10 characters using A-Z, 0-9, - or _";
                  return undefined;
                },
              }}
              listeners={{
                onBlur: () => {
                  codeTouchedRef.current = true;
                },
              }}
            >
              {(field) => (
                <field.InputField
                  label="Short code"
                  placeholder="BOM"
                  required
                  disabled={createLocation.isPending}
                />
              )}
            </form.AppField>

            <form.AppField
              name="country_code"
              validators={{
                onBlur: ({ value }) => {
                  if (!value) return "Country is required";
                  return undefined;
                },
              }}
              listeners={{
                // Cascade down: a new country invalidates the children and
                // refreshes the currency suggestion (last request wins).
                onChange: ({ value: nextCountry }) => {
                  form.setFieldValue("state_code", "");
                  form.setFieldValue("city", "");
                  const request = ++currencyRequestRef.current;
                  void getCountryCurrency(nextCountry).then((currency) => {
                    if (request === currencyRequestRef.current && !currencyTouchedRef.current) {
                      form.setFieldValue("currency", currency ?? "INR");
                    }
                  });
                },
              }}
            >
              {(field) => (
                <field.GeoSelectField
                  label="Country"
                  placeholder="Select country"
                  searchPlaceholder="Search country or code..."
                  notFoundMessage="No country found"
                  options={countryOptions.data ?? []}
                  isPending={countryOptions.isPending && !countryOptions.data}
                  required
                  disabled={createLocation.isPending}
                />
              )}
            </form.AppField>

            <form.AppField
              name="state_code"
              listeners={{
                // A new state invalidates the city below it.
                onChange: () => {
                  form.setFieldValue("city", "");
                },
              }}
            >
              {(field) => (
                <field.GeoSelectField
                  label="State"
                  placeholder={hasStates ? "Select state" : "No states"}
                  searchPlaceholder="Search state..."
                  notFoundMessage="No state found"
                  options={stateOptions.data ?? []}
                  isPending={stateOptions.isPending && !stateOptions.data}
                  disabled={createLocation.isPending || !country || !hasStates}
                  disabledHint={
                    !country
                      ? "Select a country first"
                      : !hasStates
                        ? `${countryName ?? "This country"} has no states in our data. Pick the city directly.`
                        : undefined
                  }
                />
              )}
            </form.AppField>

            <form.AppField
              name="city"
              validators={{
                onBlur: ({ value }) => {
                  if (!value.trim()) return "City is required";
                  return undefined;
                },
              }}
              listeners={{
                onChange: ({ value: city }) => {
                  if (!codeTouchedRef.current && !form.getFieldValue("name")) {
                    form.setFieldValue("code", suggestCode(city));
                  }
                },
              }}
            >
              {(field) => (
                <field.GeoSelectField
                  label="City"
                  placeholder={
                    !country
                      ? "Select country first"
                      : hasStates && !state
                        ? "Select state first"
                        : "Select city"
                  }
                  searchPlaceholder="Search city..."
                  notFoundMessage="No city found"
                  options={cityOptions.data ?? []}
                  isPending={cityOptions.isPending && !cityOptions.data}
                  allowCustom
                  required
                  disabled={
                    createLocation.isPending ||
                    !country ||
                    (hasStates && !state)
                  }
                  disabledHint={
                    !country
                      ? "Select a country first"
                      : hasStates && !state
                        ? "Select a state first"
                        : undefined
                  }
                />
              )}
            </form.AppField>

            <form.AppField
              name="currency"
              validators={{
                onBlur: ({ value }) => {
                  if (!value) return "Currency is required";
                  return undefined;
                },
              }}
              listeners={{
                onBlur: () => {
                  currencyTouchedRef.current = true;
                },
              }}
            >
              {(field) => (
                <field.GeoSelectField
                  label="Currency"
                  placeholder="Select currency"
                  searchPlaceholder="Search currency..."
                  notFoundMessage="No currency found"
                  options={currencyOptions.data ?? []}
                  isPending={currencyOptions.isPending && !currencyOptions.data}
                  required
                  disabled={createLocation.isPending}
                />
              )}
            </form.AppField>

            <form.AppField
              name="postal_code"
              validators={{
                onBlur: ({ value }) => {
                  if (value.trim().length > 20)
                    return "Postal code must be at most 20 characters";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <field.InputField
                  label="Postal code"
                  placeholder="400059"
                  disabled={createLocation.isPending}
                />
              )}
            </form.AppField>

            <form.AppField
              name="address_line1"
              validators={{
                onBlur: ({ value }) => {
                  if (value.trim().length > 200)
                    return "Address must be at most 200 characters";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <field.InputField
                  label="Address line 1"
                  placeholder="12 Mumbai Suburban"
                  disabled={createLocation.isPending}
                  className="sm:col-span-2"
                />
              )}
            </form.AppField>

            <form.AppField
              name="address_line2"
              validators={{
                onBlur: ({ value }) => {
                  if (value.trim().length > 200)
                    return "Address must be at most 200 characters";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <field.InputField
                  label="Address line 2"
                  placeholder="Andheri East"
                  disabled={createLocation.isPending}
                  className="sm:col-span-2"
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
            {canGoBack && onBack && (
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                disabled={createLocation.isPending}
                className="w-full sm:mr-auto sm:w-auto"
              >
                <ChevronLeftIcon />
                Back
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
                  Add location
                </Button>
              )}
            </form.Subscribe>
          </div>
        </Suspense>
      </form>
    </form.AppForm>
  );
}
