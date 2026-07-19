// Router
import { createFileRoute } from "@tanstack/react-router";

// UI Components
import SidebarLayout from "@/components/sidebar-layout";

// Feature Components
import PageHeader from "@/components/shared/PageHeader";
import { PassengerForm } from "@/features/passengers/components/PassengerForm";

export const Route = createFileRoute("/passengers/create")({
  component: CreatePassengerPage,
});

function CreatePassengerPage() {
  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Passengers", href: "/passengers" },
        { label: "Create" },
      ]}
    >
      <PageHeader
        title="Create Passenger"
        description="Add a new passenger profile with identity and travel document details."
        back="/passengers"
      />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <PassengerForm />
      </div>
    </SidebarLayout>
  );
}
