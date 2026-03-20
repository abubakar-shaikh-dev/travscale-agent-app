// Router
import { createFileRoute } from "@tanstack/react-router";

// UI Components
import SidebarLayout from "@/components/sidebar-layout";
import { Skeleton } from "@/components/ui/skeleton";

// Feature Components
import PageHeader from "@/components/shared/PageHeader";
import { CustomerForm } from "@/features/customers/components/CustomerForm";

// Hooks
import { useCustomer } from "@/features/customers/queries";

export const Route = createFileRoute("/customers/$customerId/edit")({
  component: EditCustomerPage,
});

/**
 * Edit Customer Page
 *
 * UX Design Decisions:
 * - Loads existing customer data before showing form
 * - Skeleton loader matches form layout for smooth transition
 * - Page title indicates edit mode
 * - Back button returns to customer list
 */
function EditCustomerPage() {
  const { customerId } = Route.useParams();
  const { data: response, isLoading, error } = useCustomer(customerId);

  const customer = response?.data;

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
        description={
          customer
            ? `Editing ${customer.name}`
            : "Update customer information"
        }
        back="/customers"
      />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {isLoading && <EditFormSkeleton />}

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-center">
            <p className="text-sm text-destructive">
              Failed to load customer data. Please try again.
            </p>
          </div>
        )}

        {customer && <CustomerForm customer={customer} />}
      </div>
    </SidebarLayout>
  );
}

/**
 * Skeleton that matches the form layout for perceived performance.
 */
function EditFormSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-6">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}
