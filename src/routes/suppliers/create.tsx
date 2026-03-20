// Router
import { createFileRoute } from "@tanstack/react-router";

// UI Components  
import SidebarLayout from "@/components/sidebar-layout";

// Feature Components
import PageHeader from "@/components/shared/PageHeader";
import { SupplierForm } from "@/features/suppliers/components/SupplierForm";

export const Route = createFileRoute("/suppliers/create")({
  component: CreateSupplierPage,
});

function CreateSupplierPage() {
  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Suppliers", href: "/suppliers" },
        { label: "Add Supplier" },
      ]}
    >
      <PageHeader
        title="Add New Supplier"
        description="Create a new supplier and map supported travel services."
        back="/suppliers"
      />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <SupplierForm />
      </div>
    </SidebarLayout>
  );
}
