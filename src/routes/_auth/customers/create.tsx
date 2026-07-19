// Router
import { createFileRoute } from "@tanstack/react-router";

// UI Components
import SidebarLayout from "@/components/sidebar-layout";

// Feature Components
import PageHeader from "@/components/shared/PageHeader";
import { CustomerForm } from "@/features/customers/components/CustomerForm";

export const Route = createFileRoute("/customers/create")({
  component: CreateCustomerPage,
});

/**
 * Create Customer Page
 *
 * UX Design Decisions (following saas-admin-dashboard-ux skill):
 *
 * 1. Clear Information Hierarchy:
 *    - Breadcrumbs provide navigation context (Tier 3)
 *    - Page header with back button for easy escape
 *    - Form is the primary focus (Tier 1)
 *
 * 2. Actionability:
 *    - Clear page title tells user what they're doing
 *    - Back button always accessible
 *    - Form has clear submit/cancel actions
 *
 * 3. Empty State Prevention:
 *    - Form fields have meaningful placeholders with examples
 *    - Required fields are validated with helpful error messages
 *
 * 4. Responsive:
 *    - Card container provides visual boundaries
 *    - Form adapts to screen size (2-col on desktop, 1-col on mobile)
 */
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
        description="Add a new customer to your database. Required fields are marked."
        back="/customers"
      />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <CustomerForm />
      </div>
    </SidebarLayout>
  );
}
