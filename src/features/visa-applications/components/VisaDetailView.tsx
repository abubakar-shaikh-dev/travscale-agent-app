// Icons
import {
  BanknoteIcon,
  CalendarIcon,
  ClipboardListIcon,
  GlobeIcon,
  PlaneIcon,
  SettingsIcon,
  ShieldCheckIcon,
} from "lucide-react";

// Feature Components
import { DocumentChecklist } from "./DocumentChecklist";
import { PassengerSummaryCard } from "./PassengerSummaryCard";
import { VisaStatusBadge } from "./VisaStatusBadge";
import { VisaStatusTimeline } from "./VisaStatusTimeline";

// Types
import type { VisaApplication } from "../types";

interface VisaDetailViewProps {
  application: VisaApplication;
}

function DetailCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );
}

export function VisaDetailView({ application }: VisaDetailViewProps) {
  const formatDate = (date?: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Status Badge — prominent */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Current Status:</span>
        <VisaStatusBadge status={application.status} className="text-sm" />
      </div>

      {/* Passenger */}
      <PassengerSummaryCard
        name={application.passengerName}
        passportNumber={application.passportNumber}
        nationality={application.nationality}
        dateOfBirth={application.dateOfBirth}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Destination & Visa Type */}
        <DetailCard icon={GlobeIcon} title="Destination & Visa Type">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow
              label="Destination"
              value={application.destinationCountry}
            />
            <InfoRow label="Visa Type" value={application.visaType} />
            <InfoRow label="Category" value={application.visaCategory} />
            <InfoRow
              label="Processing Type"
              value={application.processingType}
            />
            {application.embassyConsulate && (
              <InfoRow
                label="Embassy / Consulate"
                value={application.embassyConsulate}
              />
            )}
          </div>
        </DetailCard>

        {/* Travel Intent */}
        <DetailCard icon={PlaneIcon} title="Travel Intent">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow
              label="Travel Date"
              value={formatDate(application.intendedTravelDate)}
            />
            <InfoRow
              label="Return Date"
              value={formatDate(application.intendedReturnDate)}
            />
            <InfoRow
              label="Duration"
              value={`${application.durationOfStay} day${application.durationOfStay === 1 ? "" : "s"}`}
            />
            <InfoRow label="Trip Type" value={application.tripType} />
            {application.purposeOfVisit && (
              <InfoRow
                label="Purpose"
                value={application.purposeOfVisit}
              />
            )}
          </div>
        </DetailCard>

        {/* Application Logistics */}
        <DetailCard icon={SettingsIcon} title="Application Logistics">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow
              label="Application Date"
              value={formatDate(application.applicationDate)}
            />
            <InfoRow
              label="Expected Decision"
              value={formatDate(application.expectedDecisionDate)}
            />
            <InfoRow
              label="Submission Mode"
              value={application.submissionMode}
            />
            {application.vfsCenter && (
              <InfoRow label="VFS Center" value={application.vfsCenter} />
            )}
            {application.referenceNumber && (
              <InfoRow
                label="Reference Number"
                value={application.referenceNumber}
              />
            )}
          </div>
        </DetailCard>

        {/* Fees */}
        <DetailCard icon={BanknoteIcon} title="Fees & Charges">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow
              label="Visa Fee"
              value={`${application.visaFeeCurrency} ${application.visaFeeAmount.toLocaleString()}`}
            />
            <InfoRow
              label="Service Charge"
              value={`${application.visaFeeCurrency} ${application.serviceFeeAmount.toLocaleString()}`}
            />
            <InfoRow
              label="Total"
              value={
                <span className="font-semibold">
                  {application.visaFeeCurrency}{" "}
                  {application.totalAmount.toLocaleString()}
                </span>
              }
            />
            <InfoRow
              label="Payment Status"
              value={application.paymentStatus}
            />
            {application.paymentReference && (
              <InfoRow
                label="Payment Reference"
                value={application.paymentReference}
              />
            )}
          </div>
        </DetailCard>
      </div>

      {/* Outcome — conditional */}
      {(application.visaNumber ||
        application.rejectionReason ||
        application.cancellationReason) && (
        <DetailCard icon={ShieldCheckIcon} title="Outcome">
          <div className="grid gap-4 sm:grid-cols-2">
            {application.visaNumber && (
              <InfoRow label="Visa Number" value={application.visaNumber} />
            )}
            {application.visaValidFrom && (
              <InfoRow
                label="Valid From"
                value={formatDate(application.visaValidFrom)}
              />
            )}
            {application.visaValidTo && (
              <InfoRow
                label="Valid To"
                value={formatDate(application.visaValidTo)}
              />
            )}
            {application.numEntriesGranted && (
              <InfoRow
                label="Entries Granted"
                value={application.numEntriesGranted}
              />
            )}
            {application.rejectionReason && (
              <InfoRow
                label="Rejection Reason"
                value={
                  <span className="text-red-600">
                    {application.rejectionReason}
                  </span>
                }
              />
            )}
            {application.cancellationReason && (
              <InfoRow
                label="Cancellation Reason"
                value={application.cancellationReason}
              />
            )}
          </div>
        </DetailCard>
      )}

      {/* Documents */}
      <DetailCard icon={ClipboardListIcon} title="Document Checklist">
        <DocumentChecklist documents={application.documents} readOnly />
      </DetailCard>

      {/* Status Timeline */}
      <DetailCard icon={CalendarIcon} title="Status History">
        <VisaStatusTimeline history={application.statusHistory} />
      </DetailCard>
    </div>
  );
}
