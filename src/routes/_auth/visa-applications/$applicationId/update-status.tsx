// React
import { useState } from "react";

// Router
import { createFileRoute, useNavigate } from "@tanstack/react-router";

// UI Components
import SidebarLayout from "@/components/sidebar-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

// Feature Components
import PageHeader from "@/components/shared/PageHeader";
import { PassengerSummaryCard } from "@/features/visa-applications/components/PassengerSummaryCard";
import { VisaStatusBadge } from "@/features/visa-applications/components/VisaStatusBadge";

// Hooks
import {
  useUpdateVisaApplicationStatus,
  useVisaApplication,
} from "@/features/visa-applications/queries";

// Constants
import { mockVisaApplications } from "@/features/visa-applications/dummy-data";
import { VALID_STATUS_TRANSITIONS } from "@/features/visa-applications/visa-form.constants";

// Types
import type { VisaStatus } from "@/features/visa-applications/types";

export const Route = createFileRoute(
  "/visa-applications/$applicationId/update-status",
)({
  component: UpdateVisaStatusPage,
});

function UpdateVisaStatusPage() {
  const { applicationId } = Route.useParams();
  const navigate = useNavigate();

  const { data: response, isLoading } = useVisaApplication(applicationId);
  const { mutateAsync: updateStatus, isPending } =
    useUpdateVisaApplicationStatus();

  const application =
    response?.data ??
    mockVisaApplications.find((a) => a.id === applicationId);

  const [newStatus, setNewStatus] = useState<VisaStatus | "">("");
  const [note, setNote] = useState("");

  // Conditional fields
  const [visaNumber, setVisaNumber] = useState("");
  const [visaValidFrom, setVisaValidFrom] = useState("");
  const [visaValidTo, setVisaValidTo] = useState("");
  const [numEntries, setNumEntries] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");

  if (isLoading && !application) {
    return (
      <SidebarLayout
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Visa Applications", href: "/visa-applications" },
          { label: "Update Status" },
        ]}
      >
        <PageHeader title="Update Status" back />
        <div className="space-y-4 animate-pulse">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </SidebarLayout>
    );
  }

  if (!application) {
    return (
      <SidebarLayout
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Visa Applications", href: "/visa-applications" },
          { label: "Not Found" },
        ]}
      >
        <PageHeader title="Application Not Found" back="/visa-applications" />
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-center">
          <p className="text-sm text-destructive">
            Could not find this visa application.
          </p>
        </div>
      </SidebarLayout>
    );
  }

  const validNextStatuses = VALID_STATUS_TRANSITIONS[application.status] ?? [];
  const showApprovalFields =
    newStatus === "Approved" || newStatus === "Visa Issued";
  const showRejectionField = newStatus === "Rejected";
  const showCancellationField = newStatus === "Cancelled";

  const handleSubmit = async () => {
    if (!newStatus) return;

    await updateStatus({
      id: applicationId,
      payload: {
        status: newStatus as VisaStatus,
        note: note.trim() || undefined,
        ...(showApprovalFields && {
          visaNumber: visaNumber.trim() || undefined,
          visaValidFrom: visaValidFrom || undefined,
          visaValidTo: visaValidTo || undefined,
          numEntriesGranted: numEntries ? parseInt(numEntries, 10) : undefined,
        }),
        ...(showRejectionField && {
          rejectionReason: rejectionReason.trim() || undefined,
        }),
        ...(showCancellationField && {
          cancellationReason: cancellationReason.trim() || undefined,
        }),
      },
    });

    navigate({
      to: "/visa-applications/$applicationId",
      params: { applicationId },
    });
  };

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Visa Applications", href: "/visa-applications" },
        {
          label: application.passengerName,
          href: `/visa-applications/${applicationId}`,
        },
        { label: "Update Status" },
      ]}
    >
      <PageHeader
        title="Update Visa Status"
        description={`${application.passengerName} — ${application.destinationCountry} ${application.visaType}`}
        back={`/visa-applications/${applicationId}`}
      />

      <div className="max-w-2xl space-y-6">
        {/* Passenger context */}
        <PassengerSummaryCard
          name={application.passengerName}
          passportNumber={application.passportNumber}
          nationality={application.nationality}
          dateOfBirth={application.dateOfBirth}
        />

        <div className="rounded-lg border bg-card p-6 shadow-sm space-y-6">
          {/* Current status */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Current Status:
            </span>
            <VisaStatusBadge status={application.status} />
          </div>

          {/* New status */}
          {validNextStatuses.length === 0 ? (
            <div className="rounded-md border bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                This application has reached a terminal status. No further
                transitions are available.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="new-status">
                  New Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as VisaStatus)}
                >
                  <SelectTrigger id="new-status">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectPopup>
                    {validNextStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note about this status change..."
                  rows={3}
                />
              </div>

              {/* Conditional: Approval fields */}
              {showApprovalFields && (
                <div className="space-y-4 rounded-md border bg-green-50/30 p-4">
                  <p className="text-sm font-medium text-green-700">
                    Approval Details
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="visa-number">Visa Number</Label>
                      <input
                        id="visa-number"
                        type="text"
                        value={visaNumber}
                        onChange={(e) => setVisaNumber(e.target.value)}
                        placeholder="e.g. UAE-TV-2026-88312"
                        className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="num-entries">Entries Granted</Label>
                      <input
                        id="num-entries"
                        type="number"
                        value={numEntries}
                        onChange={(e) => setNumEntries(e.target.value)}
                        placeholder="e.g. 1"
                        className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valid-from">Valid From</Label>
                      <input
                        id="valid-from"
                        type="date"
                        value={visaValidFrom}
                        onChange={(e) => setVisaValidFrom(e.target.value)}
                        className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valid-to">Valid To</Label>
                      <input
                        id="valid-to"
                        type="date"
                        value={visaValidTo}
                        onChange={(e) => setVisaValidTo(e.target.value)}
                        className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional: Rejection */}
              {showRejectionField && (
                <div className="space-y-2 rounded-md border bg-red-50/30 p-4">
                  <Label htmlFor="rejection-reason" className="text-red-700">
                    Rejection Reason <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain the reason for rejection..."
                    rows={3}
                  />
                </div>
              )}

              {/* Conditional: Cancellation */}
              {showCancellationField && (
                <div className="space-y-2 rounded-md border bg-slate-50 p-4">
                  <Label htmlFor="cancellation-reason">
                    Cancellation Reason
                  </Label>
                  <Textarea
                    id="cancellation-reason"
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Reason for cancellation (optional)..."
                    rows={3}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() =>
                    navigate({
                      to: "/visa-applications/$applicationId",
                      params: { applicationId },
                    })
                  }
                >
                  Cancel
                </Button>
                <Button
                  disabled={!newStatus || isPending}
                  onClick={handleSubmit}
                >
                  {isPending ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
