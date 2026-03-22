// Router
import { createFileRoute } from "@tanstack/react-router";

// UI Components
import SidebarLayout from "@/components/sidebar-layout";
import { Skeleton } from "@/components/ui/skeleton";

// Feature Components
import PageHeader from "@/components/shared/PageHeader";
import { SupplierForm } from "@/features/suppliers/components/SupplierForm";

// Hooks
import { useSupplier } from "@/features/suppliers/queries";

export const Route = createFileRoute("/suppliers/$supplierId/edit")({
  component: EditSupplierPage,
});

/**
 * Edit Supplier Page
 *
 * UX Design Decisions:
 * - Loads existing supplier data before showing form
 * - Skeleton loader matches form layout for smooth transition
 * - Page title indicates edit mode
 * - Back button returns to supplier list
 */
function EditSupplierPage() {
  const { supplierId } = Route.useParams();
  const { data: supplier, isLoading, error } = useSupplier(supplierId);

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Suppliers", href: "/suppliers" },
        { label: "Edit" },
      ]}
    >
      <PageHeader
        title="Edit Supplier"
        description={
          supplier
            ? `Editing ${supplier.name}`
            : "Update supplier information"
        }
        back="/suppliers"
      />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {isLoading && <EditFormSkeleton />}

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-center">
            <p className="text-sm text-destructive">
              Failed to load supplier data. Please try again.
            </p>
          </div>
        )}

        {supplier && <SupplierForm supplier={supplier} />}
      </div>
    </SidebarLayout>
  );
}

/**
 * Skeleton that matches the supplier form layout for perceived performance.
 */
function EditFormSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
        <div className="space-y-2 sm:col-span-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center space-x-3 rounded-lg border p-3"
            >
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-6">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}
