// React
import { useState } from "react";

// Router
import { createFileRoute, Link } from "@tanstack/react-router";

// UI Components
import { Button } from "@/components/ui/button";
import SidebarLayout from "@/components/sidebar-layout";

// Icons
import { PencilIcon, PlusIcon } from "lucide-react";

// Feature Components
import PageHeader from "@/components/shared/PageHeader";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/DataTable";
import { DeleteCustomerButton } from "@/features/customers/components/DeleteCustomerButton";

// Types
import type { Customer } from "@/features/customers/types";

export const Route = createFileRoute("/customers/")({
  component: CustomersPage,
});

// Mock data for demonstration (remove when API is connected)
const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 8901",
    gender: "male",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 234 567 8902",
    gender: "female",
    createdAt: "2024-01-16T14:20:00Z",
    updatedAt: "2024-01-16T14:20:00Z",
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert.j@example.com",
    phone: "+1 234 567 8903",
    gender: "male",
    createdAt: "2024-01-17T09:15:00Z",
    updatedAt: "2024-01-17T09:15:00Z",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "+1 234 567 8904",
    gender: "female",
    createdAt: "2024-01-18T16:45:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "5",
    name: "Michael Wilson",
    email: "m.wilson@example.com",
    phone: "+1 234 567 8905",
    gender: "male",
    createdAt: "2024-01-19T11:00:00Z",
    updatedAt: "2024-01-19T11:00:00Z",
  },
  {
    id: "6",
    name: "Sarah Brown",
    email: "sarah.brown@example.com",
    phone: "+1 234 567 8906",
    gender: "female",
    createdAt: "2024-01-20T13:30:00Z",
    updatedAt: "2024-01-20T13:30:00Z",
  },
  {
    id: "7",
    name: "David Lee",
    email: "david.lee@example.com",
    phone: "+1 234 567 8907",
    gender: "male",
    createdAt: "2024-01-21T08:00:00Z",
    updatedAt: "2024-01-21T08:00:00Z",
  },
  {
    id: "8",
    name: "Lisa Anderson",
    email: "lisa.a@example.com",
    phone: "+1 234 567 8908",
    gender: "female",
    createdAt: "2024-01-22T15:20:00Z",
    updatedAt: "2024-01-22T15:20:00Z",
  },
  {
    id: "9",
    name: "James Taylor",
    email: "james.taylor@example.com",
    phone: "+1 234 567 8909",
    gender: "male",
    createdAt: "2024-01-23T10:45:00Z",
    updatedAt: "2024-01-23T10:45:00Z",
  },
  {
    id: "10",
    name: "Jennifer Martinez",
    email: "j.martinez@example.com",
    phone: "+1 234 567 8910",
    gender: "female",
    createdAt: "2024-01-24T12:00:00Z",
    updatedAt: "2024-01-24T12:00:00Z",
  },
  {
    id: "11",
    name: "Christopher Garcia",
    email: "chris.garcia@example.com",
    phone: "+1 234 567 8911",
    gender: "male",
    createdAt: "2024-01-25T09:30:00Z",
    updatedAt: "2024-01-25T09:30:00Z",
  },
  {
    id: "12",
    name: "Amanda Rodriguez",
    email: "amanda.r@example.com",
    phone: "+1 234 567 8912",
    gender: "female",
    createdAt: "2024-01-26T14:15:00Z",
    updatedAt: "2024-01-26T14:15:00Z",
  },
];

function CustomersPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // TODO: Replace mock data with API call when backend is ready
  // const { data, isLoading } = useCustomers(page, pageSize);
  const isLoading = false;
  const customers = mockCustomers;
  const total = mockCustomers.length;

  const columns: DataTableColumn<Customer & { sno: number }>[] = [
    {
      key: "sno",
      title: "S.No",
      width: 70,
      align: "center",
    },
    {
      key: "name",
      title: "Name",
      sortable: true,
    },
    {
      key: "phone",
      title: "Phone Number",
      width: 160,
    },
    {
      key: "email",
      title: "Email",
    },
    {
      key: "actions",
      title: "Actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            render={
              <Link
                to="/customers/$customerId/edit"
                params={{ customerId: record.id }}
              />
            }
            aria-label={`Edit ${record.name}`}
          >
            <PencilIcon />
          </Button>
          <DeleteCustomerButton customer={record} />
        </div>
      ),
    },
  ];

  // Add S.No to data
  const dataWithSno = customers.map((customer, index) => ({
    ...customer,
    sno: (page - 1) * pageSize + index + 1,
  }));

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Customers" },
      ]}
    >
      <PageHeader
        title="Customers"
        description="Manage your customer database"
        actions={
          <Button render={<Link to="/customers/create" />}>
            <PlusIcon />
            Create Customer
          </Button>
        }
      />

      <DataTable
        dataSource={dataWithSno}
        columns={columns}
        rowKey="id"
        loading={isLoading}
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
