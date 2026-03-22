// React
import { Suspense } from "react";

// Router
import { useNavigate } from "@tanstack/react-router";

// Icons
import {
  BusIcon,
  FileTextIcon,
  HotelIcon,
  PlaneIcon,
  ShieldIcon,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";

// Form
import { useAppForm } from "@/lib/form/form-context";
import { supplierFormDefaults } from "../supplier-form.options";

// Hooks
import { useCreateSupplier, useUpdateSupplier } from "../queries";

// Types
import type { Supplier, ServiceType } from "../types";

// Constants
const SERVICE_TYPE_OPTIONS: {
  label: string;
  value: ServiceType;
  icon: React.ReactNode;
}[] = [
  {
    label: "Visa",
    value: "visa",
    icon: <ShieldIcon className="size-4" />,
  },
  {
    label: "Passport",
    value: "passport",
    icon: <FileTextIcon className="size-4" />,
  },
  {
    label: "Hotels",
    value: "hotels",
    icon: <HotelIcon className="size-4" />,
  },
  {
    label: "Bus",
    value: "bus",
    icon: <BusIcon className="size-4" />,
  },
  {
    label: "Flight",
    value: "flight",
    icon: <PlaneIcon className="size-4" />,
  },
];

interface SupplierFormProps {
  /** Existing supplier data for edit mode */
  supplier?: Supplier;
  /** Callback after successful save */
  onSuccess?: () => void;
}

/**
 * Supplier create/edit form.
 *
 * UX Design Decisions:
 * - Two-section layout: Contact Information and Services
 * - Two-column grid on desktop to match customer form rhythm
 * - Clear visual hierarchy: contact info first, then services
 * - Inline validation with onBlur for immediate feedback
 * - Form-level onSubmit validation as safety net
 * - Cancel button always visible for easy escape hatch
 * - Submit button clearly indicates create vs update action
 *
 * Following TanStack Form v1 patterns with field-level validators
 * to avoid global re-render issues.
 */
export function SupplierForm({ supplier, onSuccess }: SupplierFormProps) {
  const navigate = useNavigate();
  const { mutateAsync: createSupplier, isPending: isCreating } =
    useCreateSupplier();
  const { mutateAsync: updateSupplier, isPending: isUpdating } =
    useUpdateSupplier();

  const isEditMode = !!supplier;
  const isSaving = isCreating || isUpdating;

  const form = useAppForm({
    defaultValues: supplier
      ? {
          name: supplier.name,
          contactPersonName: supplier.contactPersonName,
          contactPersonPhone: supplier.contactPersonPhone,
          whatsappNumber: supplier.whatsappNumber,
          contactPersonEmail: supplier.contactPersonEmail,
          website: supplier.website || "",
          address: supplier.address,
          serviceTypes: supplier.serviceTypes,
        }
      : supplierFormDefaults,
    onSubmit: async ({ value }) => {
      if (isEditMode) {
        await updateSupplier({ id: supplier.id, ...value });
      } else {
        await createSupplier(value);
      }
      onSuccess?.();
      navigate({ to: "/suppliers" });
    },
  });

  const handleCancel = () => {
    navigate({ to: "/suppliers" });
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
          {/* Supplier Information Section */}
          <section className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <form.AppField
                name="name"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Supplier name is required";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.InputField
                    label="Supplier Name"
                    placeholder="e.g. Al-Rashid Travel Services"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField
                name="contactPersonName"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Contact person name is required";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.InputField
                    label="Contact Person"
                    placeholder="e.g. Ahmed Al-Rashid"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField
                name="contactPersonEmail"
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
                    required
                  />
                )}
              </form.AppField>

              <form.AppField
                name="contactPersonPhone"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Phone number is required";
                    if (value.length < 7)
                      return "Please enter a valid phone number";
                    return undefined;
                  },
                }}
              >
                {(field) => <field.PhoneField label="Contact Phone" required />}
              </form.AppField>

              <form.AppField
                name="whatsappNumber"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "WhatsApp number is required";
                    if (value.length < 7)
                      return "Please enter a valid WhatsApp number";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.PhoneField label="WhatsApp Number" required />
                )}
              </form.AppField>

              <form.AppField
                name="website"
                validators={{
                  onBlur: ({ value }) => {
                    if (value && value.trim() !== "") {
                      try {
                        new URL(value);
                      } catch {
                        return "Please enter a valid URL";
                      }
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.InputField
                    label="Website"
                    type="url"
                    placeholder="e.g. https://example.com"
                  />
                )}
              </form.AppField>

              <form.AppField
                name="address"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Address is required";
                    if (value.length < 10)
                      return "Address must be at least 10 characters";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.InputField
                    label="Address"
                    placeholder="e.g. 123 Business District, Dubai, UAE"
                    className="sm:col-span-2"
                    required
                  />
                )}
              </form.AppField>
            </div>
          </section>

          {/* Services Section */}
          <section className="space-y-6">
            <form.AppField
              name="serviceTypes"
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.length === 0)
                    return "Please select at least one service type";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <field.CheckboxGroupField
                  label="Service Types"
                  columns={2}
                  description="Pick all services this supplier can fulfill for booking operations."
                  options={SERVICE_TYPE_OPTIONS}
                  required
                />
              )}
            </form.AppField>
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
                      ? "Update Supplier"
                      : "Create Supplier"}
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
      {/* Section 1 header skeleton */}
      <div className="space-y-1">
        <div className="h-6 w-48 rounded bg-muted" />
        <div className="h-4 w-80 rounded bg-muted" />
      </div>

      {/* Form fields skeleton */}
      <div className="grid gap-6 sm:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-11 rounded-md bg-muted" />
          </div>
        ))}
        <div className="space-y-2 sm:col-span-2">
          <div className="h-4 w-20 rounded bg-muted" />
          <div className="h-11 rounded-md bg-muted" />
        </div>
      </div>

      {/* Section 2 header skeleton */}
      <div className="space-y-1">
        <div className="h-6 w-40 rounded bg-muted" />
        <div className="h-4 w-72 rounded bg-muted" />
      </div>

      {/* Checkbox group skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center space-x-3 rounded-lg border p-3"
            >
              <div className="h-5 w-5 rounded bg-muted" />
              <div className="h-4 w-32 rounded bg-muted" />
            </div>
          ))}
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
