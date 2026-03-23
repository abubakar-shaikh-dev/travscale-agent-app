// React
import { Suspense, useCallback, useState } from "react";

// Router
import { useNavigate } from "@tanstack/react-router";

// UI Components
import { Button } from "@/components/ui/button";

// Form
import { useAppForm } from "@/lib/form/form-context";
import { visaFormDefaults } from "../visa-form.options";

// Feature Components
import { DocumentChecklist } from "./DocumentChecklist";
import { PassengerSummaryCard } from "./PassengerSummaryCard";

// Constants
import {
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  DOCUMENT_TEMPLATES,
  PAYMENT_STATUS_OPTIONS,
  PROCESSING_TYPE_OPTIONS,
  SUBMISSION_MODE_OPTIONS,
  TRIP_TYPE_OPTIONS,
  VISA_CATEGORY_OPTIONS,
  VISA_TYPE_OPTIONS,
} from "../visa-form.constants";

// Hooks
import { useCreateVisaApplication } from "../queries";

// Types
import type { DocumentChecklistItem, TripType } from "../types";

interface PassengerContext {
  id: string;
  name: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
}

interface VisaApplicationFormProps {
  passenger: PassengerContext;
}

export function VisaApplicationForm({ passenger }: VisaApplicationFormProps) {
  const navigate = useNavigate();
  const { mutateAsync: createApplication, isPending } =
    useCreateVisaApplication();

  const [documents, setDocuments] = useState<DocumentChecklistItem[]>([]);
  const [localTripType, setLocalTripType] = useState("");
  const [localSubmissionMode, setLocalSubmissionMode] = useState("");
  const [localTravelDate, setLocalTravelDate] = useState("");
  const [localReturnDate, setLocalReturnDate] = useState("");
  const [localVisaFee, setLocalVisaFee] = useState(0);
  const [localServiceFee, setLocalServiceFee] = useState(0);

  const form = useAppForm({
    defaultValues: {
      ...visaFormDefaults,
      passengerId: passenger.id,
    },
    onSubmit: async ({ value }) => {
      const travelDate = new Date(value.intendedTravelDate);
      const returnDate = new Date(value.intendedReturnDate);
      const duration = Math.ceil(
        (returnDate.getTime() - travelDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      await createApplication({
        ...value,
        durationOfStay: duration,
        documents,
        embassyConsulate: value.embassyConsulate?.trim() || undefined,
        purposeOfVisit: value.purposeOfVisit?.trim() || undefined,
        expectedDecisionDate: value.expectedDecisionDate || undefined,
        vfsCenter: value.vfsCenter?.trim() || undefined,
        paymentReference: value.paymentReference?.trim() || undefined,
      } as Parameters<typeof createApplication>[0]);

      navigate({ to: "/visa-applications" });
    },
  });

  // Compute duration text
  const durationText = (() => {
    if (!localTravelDate || !localReturnDate) return null;
    const diff = Math.ceil(
      (new Date(localReturnDate).getTime() -
        new Date(localTravelDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return diff > 0 ? `${diff} day${diff === 1 ? "" : "s"}` : null;
  })();

  // Handle trip type change → update documents
  const handleTripTypeChange = useCallback((value: string) => {
    setLocalTripType(value);
    if (value && DOCUMENT_TEMPLATES[value as TripType]) {
      setDocuments(
        DOCUMENT_TEMPLATES[value as TripType].map((d) => ({ ...d })),
      );
    } else {
      setDocuments([]);
    }
  }, []);

  // Document checklist toggle
  const handleDocToggle = useCallback((index: number) => {
    setDocuments((prev) => {
      const next = [...prev];
      const statusCycle = ["pending", "uploaded", "verified"] as const;
      const currentIdx = statusCycle.indexOf(next[index].status);
      next[index] = {
        ...next[index],
        status: statusCycle[(currentIdx + 1) % statusCycle.length],
      };
      return next;
    });
  }, []);

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
          {/* ── Section 1: Passenger (read-only) ── */}
          <PassengerSummaryCard
            name={passenger.name}
            passportNumber={passenger.passportNumber}
            nationality={passenger.nationality}
            dateOfBirth={passenger.dateOfBirth}
          />

          {/* ── Section 2: Destination & Visa Type ── */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold">
              Destination & Visa Type
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <form.AppField
                name="destinationCountry"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Destination country is required";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.SelectField
                    label="Destination Country"
                    options={[...COUNTRY_OPTIONS]}
                    placeholder="Select country"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField
                name="visaType"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Visa type is required";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.SelectField
                    label="Visa Type"
                    options={[...VISA_TYPE_OPTIONS]}
                    placeholder="Select visa type"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField
                name="visaCategory"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Visa category is required";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.SelectField
                    label="Visa Category"
                    options={[...VISA_CATEGORY_OPTIONS]}
                    placeholder="Select category"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField
                name="processingType"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Processing type is required";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.SelectField
                    label="Processing Type"
                    options={[...PROCESSING_TYPE_OPTIONS]}
                    placeholder="Select processing type"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField name="embassyConsulate">
                {(field) => (
                  <field.InputField
                    label="Embassy / Consulate"
                    placeholder="e.g. UAE Consulate Mumbai"
                    className="sm:col-span-2"
                  />
                )}
              </form.AppField>
            </div>
          </section>

          {/* ── Section 3: Travel Intent ── */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold">Travel Intent</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <form.AppField
                name="intendedTravelDate"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Travel date is required";
                    return undefined;
                  },
                }}
                listeners={{
                  onChange: ({ value }) => setLocalTravelDate(value),
                }}
              >
                {(field) => (
                  <field.DatePickerField
                    label="Intended Travel Date"
                    startMonth={new Date()}
                    required
                  />
                )}
              </form.AppField>

              <form.AppField
                name="intendedReturnDate"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Return date is required";
                    return undefined;
                  },
                }}
                listeners={{
                  onChange: ({ value }) => setLocalReturnDate(value),
                }}
              >
                {(field) => (
                  <field.DatePickerField
                    label="Intended Return Date"
                    startMonth={new Date()}
                    required
                  />
                )}
              </form.AppField>

              {durationText && (
                <div className="flex items-center sm:col-span-2">
                  <p className="text-sm text-muted-foreground">
                    Duration of stay:{" "}
                    <span className="font-medium text-foreground">
                      {durationText}
                    </span>
                  </p>
                </div>
              )}

              <form.AppField
                name="tripType"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Trip type is required";
                    return undefined;
                  },
                }}
                listeners={{
                  onChange: ({ value }) => handleTripTypeChange(value),
                }}
              >
                {(field) => (
                  <field.SelectField
                    label="Trip Type"
                    options={[...TRIP_TYPE_OPTIONS]}
                    placeholder="Select trip type"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField name="purposeOfVisit">
                {(field) => (
                  <field.InputField
                    label="Purpose of Visit"
                    placeholder="e.g. Family vacation"
                  />
                )}
              </form.AppField>
            </div>
          </section>

          {/* ── Section 4: Application Logistics ── */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold">Application Logistics</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <form.AppField
                name="applicationDate"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Application date is required";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.DatePickerField
                    label="Application Date"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField name="expectedDecisionDate">
                {(field) => (
                  <field.DatePickerField
                    label="Expected Decision Date"
                    startMonth={new Date()}
                  />
                )}
              </form.AppField>

              <form.AppField
                name="submissionMode"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Submission mode is required";
                    return undefined;
                  },
                }}
                listeners={{
                  onChange: ({ value }) => setLocalSubmissionMode(value),
                }}
              >
                {(field) => (
                  <field.SelectField
                    label="Submission Mode"
                    options={[...SUBMISSION_MODE_OPTIONS]}
                    placeholder="Select mode"
                    required
                  />
                )}
              </form.AppField>

              {localSubmissionMode === "VFS" && (
                <form.AppField name="vfsCenter">
                  {(field) => (
                    <field.InputField
                      label="VFS Center"
                      placeholder="e.g. VFS Global Mumbai"
                    />
                  )}
                </form.AppField>
              )}
            </div>
          </section>

          {/* ── Section 5: Document Checklist ── */}
          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold">Document Checklist</h3>
              <p className="text-sm text-muted-foreground">
                {localTripType
                  ? "Click a document to cycle its status: Pending → Uploaded → Verified"
                  : "Select a trip type above to see required documents"}
              </p>
            </div>
            <DocumentChecklist
              documents={documents}
              onToggle={handleDocToggle}
            />
          </section>

          {/* ── Section 6: Fees & Charges ── */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold">Fees & Charges</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <form.AppField
                name="visaFeeAmount"
                listeners={{
                  onChange: ({ value }) =>
                    setLocalVisaFee(Number(value) || 0),
                }}
              >
                {(field) => (
                  <field.InputField
                    label="Visa Fee"
                    placeholder="0"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField
                name="visaFeeCurrency"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Currency is required";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.SelectField
                    label="Currency"
                    options={[...CURRENCY_OPTIONS]}
                    placeholder="Select currency"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField
                name="serviceFeeAmount"
                listeners={{
                  onChange: ({ value }) =>
                    setLocalServiceFee(Number(value) || 0),
                }}
              >
                {(field) => (
                  <field.InputField
                    label="Service Charge"
                    placeholder="0"
                  />
                )}
              </form.AppField>

              <div className="flex items-end">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Total Amount</p>
                  <p className="h-11 flex items-center rounded-md border bg-muted/50 px-3 text-sm font-semibold">
                    {localVisaFee + localServiceFee}
                  </p>
                </div>
              </div>

              <form.AppField
                name="paymentStatus"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) return "Payment status is required";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <field.SelectField
                    label="Payment Status"
                    options={[...PAYMENT_STATUS_OPTIONS]}
                    placeholder="Select status"
                    required
                  />
                )}
              </form.AppField>

              <form.AppField name="paymentReference">
                {(field) => (
                  <field.InputField
                    label="Payment Reference"
                    placeholder="e.g. PAY-2026-0301-A"
                  />
                )}
              </form.AppField>
            </div>
          </section>

          {/* ── Actions ── */}
          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/visa-applications" })}
              disabled={isPending}
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
                  {isSubmitting ? "Submitting..." : "Create Application"}
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
      <div className="h-20 rounded-lg bg-muted" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="h-5 w-40 rounded bg-muted" />
          <div className="grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="space-y-2">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-11 rounded-md bg-muted" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-end gap-3 border-t pt-6">
        <div className="h-10 w-20 rounded-md bg-muted" />
        <div className="h-10 w-36 rounded-md bg-muted" />
      </div>
    </div>
  );
}
