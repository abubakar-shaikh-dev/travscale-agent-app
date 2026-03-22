// React
import { Suspense } from "react";

// Utils
import { Country } from "country-state-city";

// Router
import { useNavigate } from "@tanstack/react-router";

// UI Components
import { Button } from "@/components/ui/button";

// Form
import { useAppForm } from "@/lib/form/form-context";
import { passengerFormDefaults } from "../passenger-form.options";

// Hooks
import { useCreatePassenger, useUpdatePassenger } from "../queries";

// Types
import type { Passenger } from "../types";

interface PassengerFormProps {
  passenger?: Passenger;
  onSuccess?: () => void;
}

const NATIONALITY_OPTIONS = Country.getAllCountries()
  .map((country) => ({
    label: country.name,
    value: country.name,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export function PassengerForm({ passenger, onSuccess }: PassengerFormProps) {
  const navigate = useNavigate();
  const { mutateAsync: createPassenger, isPending: isCreating } =
    useCreatePassenger();
  const { mutateAsync: updatePassenger, isPending: isUpdating } =
    useUpdatePassenger();

  const isEditMode = !!passenger;
  const isSaving = isCreating || isUpdating;

  const form = useAppForm({
    defaultValues: passenger
      ? {
          firstName: passenger.firstName,
          middleName: passenger.middleName || "",
          lastName: passenger.lastName || "",
          dateOfBirth: passenger.dateOfBirth,
          nationality: passenger.nationality,
          phone: passenger.phone,
          email: passenger.email,
          passportNumber: passenger.passportNumber,
          passportExpiry: passenger.passportExpiry,
          notes: passenger.notes || "",
        }
      : passengerFormDefaults,
    onSubmit: async ({ value }) => {
      const payload = {
        ...value,
        middleName: value.middleName?.trim() || undefined,
        lastName: value.lastName?.trim() || undefined,
        notes: value.notes?.trim() || undefined,
      };

      if (isEditMode) {
        await updatePassenger({ id: passenger.id, payload });
      } else {
        await createPassenger(payload);
      }

      onSuccess?.();
      navigate({ to: "/passengers" });
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
        <Suspense fallback={<FormSkeleton />}>
          <section className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <form.AppField
                name="firstName"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value?.trim()) return "First name is required";
                    if (value.trim().length < 2) {
                      return "First name must be at least 2 characters";
                    }

                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.InputField
                    label="First Name"
                    placeholder="e.g. Ahmed"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField name="middleName">
                {(field) => (
                  <field.InputField
                    label="Middle Name"
                    placeholder="e.g. Bin"
                  />
                )}
              </form.AppField>

              <form.AppField name="lastName">
                {(field) => (
                  <field.InputField
                    label="Last Name"
                    placeholder="e.g. Rashid"
                  />
                )}
              </form.AppField>

              <form.AppField
                name="dateOfBirth"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Date of birth is required";

                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.DatePickerField
                    label="Date of Birth"
                    endMonth={new Date()}
                    required
                  />
                )}
              </form.AppField>

              <form.AppField
                name="nationality"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Nationality is required";

                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.SelectField
                    label="Nationality"
                    options={NATIONALITY_OPTIONS}
                    placeholder="Select nationality"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField
                name="phone"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Phone number is required";
                    if (value.length < 7) {
                      return "Please enter a valid phone number";
                    }

                    return undefined;
                  },
                }}
              >
                {(field) => <field.PhoneField label="Phone" required />}
              </form.AppField>

              <form.AppField
                name="email"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value?.trim()) return "Email is required";
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                      return "Please enter a valid email";
                    }

                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.InputField
                    label="Email"
                    type="email"
                    placeholder="e.g. ahmed@example.com"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField
                name="passportNumber"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value?.trim()) return "Passport number is required";
                    if (value.trim().length < 6) {
                      return "Passport number must be at least 6 characters";
                    }

                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.InputField
                    label="Passport Number"
                    placeholder="e.g. A1234567"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField
                name="passportExpiry"
                validators={{
                  onBlur: ({ value, fieldApi }) => {
                    if (!value) return "Passport expiry date is required";

                    const dateOfBirth =
                      fieldApi.form.getFieldValue("dateOfBirth");
                    if (
                      dateOfBirth &&
                      new Date(value) <= new Date(dateOfBirth)
                    ) {
                      return "Passport expiry must be after date of birth";
                    }

                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.DatePickerField
                    label="Passport Expiry"
                    endMonth={new Date(new Date().getFullYear() + 30, 11, 31)}
                    startMonth={new Date()}
                    required
                  />
                )}
              </form.AppField>

              <form.AppField name="notes">
                {(field) => (
                  <field.InputField
                    className="sm:col-span-2"
                    label="Notes"
                    placeholder="Optional notes"
                  />
                )}
              </form.AppField>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/passengers" })}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting
                    ? "Saving..."
                    : isEditMode
                      ? "Update Passenger"
                      : "Create Passenger"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </Suspense>
      </form>
    </form.AppForm>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-11 rounded-md bg-muted" />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 border-t pt-6">
        <div className="h-10 w-20 rounded-md bg-muted" />
        <div className="h-10 w-36 rounded-md bg-muted" />
      </div>
    </div>
  );
}
