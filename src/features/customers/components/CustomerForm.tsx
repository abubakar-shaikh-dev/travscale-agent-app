// React
import { Suspense } from "react";

// Router
import { useNavigate } from "@tanstack/react-router";

// Icons
import { UserIcon, UserRoundIcon } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";

// Form
import { useAppForm } from "@/lib/form/form-context";
import { customerFormDefaults } from "../customer-form.options";

// Hooks
import { useCreateCustomer, useUpdateCustomer } from "../queries";

// Types
import type { Customer, Gender } from "../types";

// Constants
const GENDER_OPTIONS: {
  label: string;
  value: Gender;
  icon: React.ReactNode;
}[] = [
  {
    label: "Male",
    value: "male",
    icon: <UserIcon className="size-4" />,
  },
  {
    label: "Female",
    value: "female",
    icon: <UserRoundIcon className="size-4" />,
  },
];

interface CustomerFormProps {
  /** Existing customer data for edit mode */
  customer?: Customer;
  /** Callback after successful save */
  onSuccess?: () => void;
}

/**
 * Customer create/edit form.
 *
 * UX Design Decisions:
 * - Two-column layout on desktop for efficient space usage
 * - Clear visual hierarchy: contact info first, then gender selection
 * - Inline validation with onBlur for immediate feedback without blocking input
 * - Form-level onSubmit validation as safety net
 * - Cancel button always visible for easy escape hatch
 * - Submit button clearly indicates create vs update action
 *
 * Following TanStack Form v1 patterns with field-level validators
 * to avoid global re-render issues.
 */
export function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const navigate = useNavigate();
  const { mutateAsync: createCustomer, isPending: isCreating } =
    useCreateCustomer();
  const { mutateAsync: updateCustomer, isPending: isUpdating } =
    useUpdateCustomer();

  const isEditMode = !!customer;
  const isSaving = isCreating || isUpdating;

  const form = useAppForm({
    defaultValues: customer
      ? {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          gender: customer.gender,
        }
      : customerFormDefaults,
    onSubmit: async ({ value }) => {
      if (isEditMode) {
        await updateCustomer({ id: customer.id, payload: value });
      } else {
        await createCustomer(value);
      }
      onSuccess?.();
      navigate({ to: "/customers" });
    },
  });

  const handleCancel = () => {
    navigate({ to: "/customers" });
  };

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
          {/* Contact Information Section */}
          <section className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Contact Information</h2>
              <p className="text-sm text-muted-foreground">
                Basic details used for communication and identification.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <form.AppField
                name="name"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Name is required";
                    if (value.length < 2)
                      return "Name must be at least 2 characters";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.InputField
                    label="Full Name"
                    placeholder="e.g. Ahmed Al-Rashid"
                  />
                )}
              </form.AppField>

              <form.AppField
                name="phone"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Phone number is required";
                    if (value.length < 7)
                      return "Please enter a valid phone number";
                    return undefined;
                  },
                }}
              >
                {(field) => <field.PhoneField label="Phone Number" />}
              </form.AppField>

              <form.AppField
                name="email"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Email is required";
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                      return "Please enter a valid email";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.InputField
                    label="Email Address"
                    type="email"
                    placeholder="e.g. ahmed@example.com"
                  />
                )}
              </form.AppField>

              <form.AppField
                name="gender"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Please select a gender";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.RadioCardField label="Gender" options={GENDER_OPTIONS} />
                )}
              </form.AppField>
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
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
                      ? "Update Customer"
                      : "Create Customer"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </Suspense>
      </form>
    </form.AppForm>
  );
}

/**
 * Skeleton loader matching form layout for perceived performance.
 * Uses same grid structure as the actual form for smooth transition.
 */
function FormSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Section header skeleton */}
      <div className="space-y-1">
        <div className="h-6 w-48 rounded bg-muted" />
        <div className="h-4 w-80 rounded bg-muted" />
      </div>

      {/* Form fields skeleton */}
      <div className="grid gap-6 sm:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-11 rounded-md bg-muted" />
          </div>
        ))}
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-muted" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 rounded-lg bg-muted" />
            <div className="h-24 rounded-lg bg-muted" />
          </div>
        </div>
      </div>

      {/* Actions skeleton */}
      <div className="flex justify-end gap-3 border-t pt-6">
        <div className="h-10 w-20 rounded-md bg-muted" />
        <div className="h-10 w-36 rounded-md bg-muted" />
      </div>
    </div>
  );
}
