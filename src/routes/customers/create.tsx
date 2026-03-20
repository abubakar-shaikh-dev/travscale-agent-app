// Router
import { createFileRoute } from "@tanstack/react-router";

// UI Components
import SidebarLayout from "@/components/sidebar-layout";

// Feature Components
import PageHeader from "@/components/shared/PageHeader";

export const Route = createFileRoute("/customers/create")({
  component: CreateCustomerPage,
});

function CreateCustomerPage() {
  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Customers", href: "/customers" },
        { label: "Create" },
      ]}
    >
      <PageHeader
        title="Create Customer"
        description="Add a new customer to your database"
        back="/customers"
      />

      {/* TODO: Add customer form */}
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Customer form coming soon...
      </div>
    </SidebarLayout>
  );
}
