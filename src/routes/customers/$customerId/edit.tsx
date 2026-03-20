// Router
import { createFileRoute } from "@tanstack/react-router";

// UI Components
import SidebarLayout from "@/components/sidebar-layout";

// Feature Components
import PageHeader from "@/components/shared/PageHeader";

export const Route = createFileRoute("/customers/$customerId/edit")({
  component: EditCustomerPage,
});

function EditCustomerPage() {
  const { customerId } = Route.useParams();

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Customers", href: "/customers" },
        { label: "Edit" },
      ]}
    >
      <PageHeader
        title="Edit Customer"
        description={`Editing customer ${customerId}`}
        back="/customers"
      />

      {/* TODO: Add customer edit form */}
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Customer edit form coming soon...
      </div>
    </SidebarLayout>
  );
}
