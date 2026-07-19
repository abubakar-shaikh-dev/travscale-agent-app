// Router
import { createFileRoute } from "@tanstack/react-router";

// UI Components
import SidebarLayout from "@/components/sidebar-layout";

// Feature Components
import PageHeader from "@/components/shared/PageHeader";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarLayout breadcrumbs={[{ label: "Dashboard" }]}>
      <PageHeader
        title="Dashboard"
        description="Welcome to your Travscale dashboard."
      />
    </SidebarLayout>
  );
}
