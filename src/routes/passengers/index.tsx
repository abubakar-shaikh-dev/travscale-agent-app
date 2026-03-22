// React
import { useState } from "react";

// Router
import { createFileRoute, Link } from "@tanstack/react-router";

// UI Components
import SidebarLayout from "@/components/sidebar-layout";
import { Button } from "@/components/ui/button";

// Icons
import { PlusIcon } from "lucide-react";

// Feature Components
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import PageHeader from "@/components/shared/PageHeader";
import { RowActionButtons } from "@/components/shared/RowActionButtons";
import { DeletePassengerButton } from "@/features/passengers/components/DeletePassengerButton";

// Hooks
import { usePassengers } from "@/features/passengers/queries";

// Types
import type { Passenger } from "@/features/passengers/types";

export const Route = createFileRoute("/passengers/")({
  component: PassengersPage,
});

// Mock data for demonstration (shown when API has no data yet)
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
    notes: "Frequent traveler to UAE",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    firstName: "Fatima",
    middleName: "",
    lastName: "Khan",
    dateOfBirth: "1994-08-27",
    nationality: "Pakistani",
    phone: "+92 3011122334",
    email: "fatima.khan@example.com",
    passportNumber: "PA239018",
    passportExpiry: "2030-02-20",
    notes: "Requires wheelchair assistance",
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
    notes: "Prefers window seat",
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
    notes: "Vegetarian meal preference",
    createdAt: "2024-01-18T16:45:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "5",
    firstName: "Omar",
    middleName: "",
    lastName: "Farooq",
    dateOfBirth: "1979-06-03",
    nationality: "Saudi",
    phone: "+966 512223344",
    email: "omar.farooq@example.com",
    passportNumber: "SA334109",
    passportExpiry: "2027-09-12",
    notes: "Business class traveler",
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
    notes: "Needs hotel near Haram",
    createdAt: "2024-01-20T13:30:00Z",
    updatedAt: "2024-01-20T13:30:00Z",
  },
  {
    id: "7",
    firstName: "Imran",
    middleName: "",
    lastName: "Malik",
    dateOfBirth: "1987-04-14",
    nationality: "Indian",
    phone: "+91 9988776655",
    email: "imran.malik@example.com",
    passportNumber: "IN553820",
    passportExpiry: "2028-04-13",
    notes: "Traveling with family",
    createdAt: "2024-01-21T08:00:00Z",
    updatedAt: "2024-01-21T08:00:00Z",
  },
  {
    id: "8",
    firstName: "Sara",
    middleName: "",
    lastName: "Nadeem",
    dateOfBirth: "2000-09-02",
    nationality: "Pakistani",
    phone: "+92 3227788990",
    email: "sara.nadeem@example.com",
    passportNumber: "PK770154",
    passportExpiry: "2033-03-01",
    notes: "First-time Umrah traveler",
    createdAt: "2024-01-22T15:20:00Z",
    updatedAt: "2024-01-22T15:20:00Z",
  },
];

function PassengersPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = usePassengers(page, pageSize);
  const passengersFromApi = data?.data;
  const hasApiData = !!passengersFromApi && passengersFromApi.length > 0;
  const pageStart = (page - 1) * pageSize;

  const passengers = hasApiData
    ? passengersFromApi
    : mockPassengers.slice(pageStart, pageStart + pageSize);
  const total = hasApiData
    ? (data?.meta.total ?? passengersFromApi.length)
    : mockPassengers.length;
  const isUsingMockData = !hasApiData;

  const columns: DataTableColumn<
    Passenger & { sno: number; fullName: string }
  >[] = [
    {
      key: "sno",
      title: "S.No",
      width: 70,
      minWidth: 56,
      align: "center",
    },
    {
      key: "fullName",
      title: "Passenger Name",
      sortable: true,
      minWidth: 180,
      ellipsis: true,
    },
    {
      key: "phone",
      title: "Phone",
      width: 160,
      minWidth: 140,
    },
    {
      key: "email",
      title: "Email",
      minWidth: 170,
      ellipsis: true,
    },
    {
      key: "passportNumber",
      title: "Passport",
      width: 140,
      minWidth: 120,
      ellipsis: true,
    },
    {
      key: "actions",
      title: "Actions",
      width: 120,
      minWidth: 100,
      align: "center",
      render: (_, record) => (
        <RowActionButtons
          editRender={
            <Link
              to="/passengers/$passengerId/edit"
              params={{ passengerId: record.id }}
            />
          }
          editLabel={`Edit ${record.fullName}`}
          deleteAction={<DeletePassengerButton passenger={record} />}
        />
      ),
    },
  ];

  const dataWithSno = passengers.map((passenger, index) => {
    const fullName = [
      passenger.firstName,
      passenger.middleName,
      passenger.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    return {
      ...passenger,
      fullName,
      sno: pageStart + index + 1,
    };
  });

  return (
    <SidebarLayout
      breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Passengers" }]}
    >
      <PageHeader
        title="Passengers"
        description="Manage passenger profiles and passport details"
        actions={
          <Button render={<Link to="/passengers/create" />}>
            <PlusIcon />
            Add Passenger
          </Button>
        }
      />

      <DataTable
        dataSource={dataWithSno}
        columns={columns}
        rowKey="id"
        loading={isLoading && !isUsingMockData}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (newPage) => setPage(newPage),
        }}
      />
    </SidebarLayout>
  );
}
