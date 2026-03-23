// Router
import { createFileRoute, Link } from "@tanstack/react-router";

// UI Components
import SidebarLayout from "@/components/sidebar-layout";
import { Button } from "@/components/ui/button";

// Icons
import { PencilIcon } from "lucide-react";

// Feature Components
import PageHeader from "@/components/shared/PageHeader";
import { VisaDetailView } from "@/features/visa-applications/components/VisaDetailView";

// Hooks
import { useVisaApplication } from "@/features/visa-applications/queries";

// Constants
import { mockVisaApplications } from "@/features/visa-applications/dummy-data";

export const Route = createFileRoute("/visa-applications/$applicationId/")(
  {
    component: VisaApplicationDetailPage,
  },
);

function VisaApplicationDetailPage() {
  const { applicationId } = Route.useParams();
  const {
    data: response,
    isLoading,
    error,
  } = useVisaApplication(applicationId);

  // Try API first, fallback to mock
  const application =
    response?.data ??
    mockVisaApplications.find((a) => a.id === applicationId);

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Visa Applications", href: "/visa-applications" },
        { label: application?.passengerName ?? "Details" },
      ]}
    >
      <PageHeader
        title={
          application
            ? `${application.passengerName} — ${application.destinationCountry}`
            : "Visa Application"
        }
        description={
          application
            ? `${application.visaType} visa · ${application.processingType}`
            : "Loading application details..."
        }
        back="/visa-applications"
        actions={
          application && (
            <Button
              render={
                <Link
                  to="/visa-applications/$applicationId/update-status"
                  params={{ applicationId }}
                />
              }
            >
              <PencilIcon />
              Update Status
            </Button>
          )
        }
      />

      <div>
        {isLoading && !application && <DetailSkeleton />}

        {error && !application && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-center">
            <p className="text-sm text-destructive">
              Failed to load application data. Please try again.
            </p>
          </div>
        )}

        {application && <VisaDetailView application={application} />}
      </div>
    </SidebarLayout>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-20 rounded-lg bg-muted" />
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-muted" />
    </div>
  );
}
