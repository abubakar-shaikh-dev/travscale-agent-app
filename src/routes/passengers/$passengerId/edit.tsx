// Router
import { createFileRoute } from "@tanstack/react-router";

// UI Components
import SidebarLayout from "@/components/sidebar-layout";
import { Skeleton } from "@/components/ui/skeleton";

// Feature Components
import PageHeader from "@/components/shared/PageHeader";
import { PassengerForm } from "@/features/passengers/components/PassengerForm";

// Hooks
import { usePassenger } from "@/features/passengers/queries";

export const Route = createFileRoute("/passengers/$passengerId/edit")({
  component: EditPassengerPage,
});

function EditPassengerPage() {
  const { passengerId } = Route.useParams();
  const { data: response, isLoading, error } = usePassenger(passengerId);

  const passenger = response?.data;
  const passengerName = passenger
    ? [passenger.firstName, passenger.middleName, passenger.lastName]
        .filter(Boolean)
        .join(" ")
    : null;

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Passengers", href: "/passengers" },
        { label: "Edit" },
      ]}
    >
      <PageHeader
        title="Edit Passenger"
        description={
          passengerName
            ? `Editing ${passengerName}`
            : "Update passenger information"
        }
        back="/passengers"
      />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {isLoading && <EditFormSkeleton />}

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-center">
            <p className="text-sm text-destructive">
              Failed to load passenger data. Please try again.
            </p>
          </div>
        )}

        {passenger && <PassengerForm passenger={passenger} />}
      </div>
    </SidebarLayout>
  );
}

function EditFormSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 border-t pt-6">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}
