// React
import { useMemo, useState } from "react";

// Router
import { createFileRoute } from "@tanstack/react-router";

// UI Components
import SidebarLayout from "@/components/sidebar-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Icons
import { SearchIcon, UserIcon } from "lucide-react";

// Feature Components
import PageHeader from "@/components/shared/PageHeader";
import { VisaApplicationForm } from "@/features/visa-applications/components/VisaApplicationForm";

// Types
import type { Passenger } from "@/features/passengers/types";

export const Route = createFileRoute("/visa-applications/create")(
  {
    component: CreateVisaApplicationPage,
  },
);

// Mock passengers for selection (same ones from passengers list)
const mockPassengers: Passenger[] = [
  {
    id: "1",
    firstName: "Ahmed",
    middleName: "Bin",
    lastName: "Rashid",
    dateOfBirth: "1989-03-12",
    nationality: "Indian",
    phone: "+91 9876543210",
    email: "ahmed.rashid@example.com",
    passportNumber: "N8745123",
    passportExpiry: "2029-07-15",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    firstName: "Fatima",
    lastName: "Khan",
    dateOfBirth: "1994-08-27",
    nationality: "Pakistani",
    phone: "+92 3011122334",
    email: "fatima.khan@example.com",
    passportNumber: "PA239018",
    passportExpiry: "2030-02-20",
    createdAt: "2024-01-16T14:20:00Z",
    updatedAt: "2024-01-16T14:20:00Z",
  },
  {
    id: "3",
    firstName: "Yusuf",
    middleName: "Ali",
    lastName: "Hasan",
    dateOfBirth: "1983-11-05",
    nationality: "Bangladeshi",
    phone: "+880 1712345678",
    email: "yusuf.hasan@example.com",
    passportNumber: "BG771256",
    passportExpiry: "2028-11-04",
    createdAt: "2024-01-17T09:15:00Z",
    updatedAt: "2024-01-17T09:15:00Z",
  },
  {
    id: "4",
    firstName: "Aisha",
    middleName: "Noor",
    lastName: "Rahman",
    dateOfBirth: "1998-01-21",
    nationality: "Malaysian",
    phone: "+60 122334455",
    email: "aisha.rahman@example.com",
    passportNumber: "MY991204",
    passportExpiry: "2031-05-30",
    createdAt: "2024-01-18T16:45:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "5",
    firstName: "Omar",
    lastName: "Farooq",
    dateOfBirth: "1979-06-03",
    nationality: "Saudi",
    phone: "+966 512223344",
    email: "omar.farooq@example.com",
    passportNumber: "SA334109",
    passportExpiry: "2027-09-12",
    createdAt: "2024-01-19T11:00:00Z",
    updatedAt: "2024-01-19T11:00:00Z",
  },
  {
    id: "6",
    firstName: "Maryam",
    middleName: "Zahra",
    lastName: "Syed",
    dateOfBirth: "1992-12-10",
    nationality: "Emirati",
    phone: "+971 501234567",
    email: "maryam.syed@example.com",
    passportNumber: "AE450712",
    passportExpiry: "2032-01-08",
    createdAt: "2024-01-20T13:30:00Z",
    updatedAt: "2024-01-20T13:30:00Z",
  },
  {
    id: "7",
    firstName: "Imran",
    lastName: "Malik",
    dateOfBirth: "1987-04-14",
    nationality: "Indian",
    phone: "+91 9988776655",
    email: "imran.malik@example.com",
    passportNumber: "IN553820",
    passportExpiry: "2028-04-13",
    createdAt: "2024-01-21T08:00:00Z",
    updatedAt: "2024-01-21T08:00:00Z",
  },
  {
    id: "8",
    firstName: "Sara",
    lastName: "Nadeem",
    dateOfBirth: "2000-09-02",
    nationality: "Pakistani",
    phone: "+92 3227788990",
    email: "sara.nadeem@example.com",
    passportNumber: "PK770154",
    passportExpiry: "2033-03-01",
    createdAt: "2024-01-22T15:20:00Z",
    updatedAt: "2024-01-22T15:20:00Z",
  },
];

function getPassengerName(p: Passenger) {
  return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ");
}

function CreateVisaApplicationPage() {
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(
    null,
  );
  const [search, setSearch] = useState("");

  const filteredPassengers = useMemo(() => {
    if (!search.trim()) return mockPassengers;
    const q = search.toLowerCase();
    return mockPassengers.filter(
      (p) =>
        getPassengerName(p).toLowerCase().includes(q) ||
        p.passportNumber.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q),
    );
  }, [search]);

  if (selectedPassenger) {
    return (
      <SidebarLayout
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Visa Applications", href: "/visa-applications" },
          { label: "New Application" },
        ]}
      >
        <PageHeader
          title="New Visa Application"
          description={`For ${getPassengerName(selectedPassenger)}`}
          back="/visa-applications"
        />

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <VisaApplicationForm
            passenger={{
              id: selectedPassenger.id,
              name: getPassengerName(selectedPassenger),
              passportNumber: selectedPassenger.passportNumber,
              nationality: selectedPassenger.nationality,
              dateOfBirth: selectedPassenger.dateOfBirth,
            }}
          />
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Visa Applications", href: "/visa-applications" },
        { label: "New Application" },
      ]}
    >
      <PageHeader
        title="Select Passenger"
        description="Search and select a passenger to start a new visa application"
        back="/visa-applications"
      />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6 space-y-2">
          <Label htmlFor="passenger-search">Search passengers</Label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="passenger-search"
              placeholder="Search by name, passport number, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filteredPassengers.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No passengers found matching &quot;{search}&quot;
            </p>
          )}

          {filteredPassengers.map((passenger) => (
            <Button
              key={passenger.id}
              variant="outline"
              className="flex h-auto w-full items-center justify-start gap-4 px-4 py-3 text-left"
              onClick={() => setSelectedPassenger(passenger)}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <UserIcon className="size-5 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-medium">
                  {getPassengerName(passenger)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {passenger.passportNumber} · {passenger.nationality} ·{" "}
                  {passenger.email}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
