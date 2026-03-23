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
import { VisaStatusBadge } from "@/features/visa-applications/components/VisaStatusBadge";

// Hooks
import { useVisaApplications } from "@/features/visa-applications/queries";

// Constants
import { mockVisaApplications } from "@/features/visa-applications/dummy-data";

// Types
import type { VisaApplication } from "@/features/visa-applications/types";

export const Route = createFileRoute("/visa-applications/")(
  {
    component: VisaApplicationsPage,
  },
);

function VisaApplicationsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useVisaApplications(page, pageSize);
  const applicationsFromApi = data?.data;
  const hasApiData = !!applicationsFromApi && applicationsFromApi.length > 0;
  const pageStart = (page - 1) * pageSize;

  const applications = hasApiData
    ? applicationsFromApi
    : mockVisaApplications.slice(pageStart, pageStart + pageSize);
  const total = hasApiData
    ? (data?.meta.total ?? applicationsFromApi.length)
    : mockVisaApplications.length;
  const isUsingMockData = !hasApiData;

  const columns: DataTableColumn<
    VisaApplication & { sno: number }
  >[] = [
    {
      key: "sno",
      title: "S.No",
      width: 70,
      minWidth: 56,
      align: "center",
    },
    {
      key: "passengerName",
      title: "Passenger",
      sortable: true,
      minWidth: 160,
      ellipsis: true,
    },
    {
      key: "destinationCountry",
      title: "Destination",
      sortable: true,
      minWidth: 140,
      ellipsis: true,
    },
    {
      key: "visaType",
      title: "Visa Type",
      width: 120,
      minWidth: 100,
    },
    {
      key: "status",
      title: "Status",
      width: 160,
      minWidth: 140,
      render: (_, record) => <VisaStatusBadge status={record.status} />,
    },
    {
      key: "applicationDate",
      title: "Applied",
      width: 120,
      minWidth: 100,
      render: (_, record) =>
        new Date(record.applicationDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "actions",
      title: "Actions",
      width: 100,
      minWidth: 80,
      align: "center",
      render: (_, record) => (
        <Button
          variant="ghost"
          size="sm"
          render={
            <Link
              to="/visa-applications/$applicationId"
              params={{ applicationId: record.id }}
            />
          }
        >
          View
        </Button>
      ),
    },
  ];

  const dataWithSno = applications.map((app, index) => ({
    ...app,
    sno: pageStart + index + 1,
  }));

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Visa Applications" },
      ]}
    >
      <PageHeader
        title="Visa Applications"
        description="Manage visa applications, track statuses, and handle document checklists"
        actions={
          <Button render={<Link to="/visa-applications/create" />}>
            <PlusIcon />
            New Application
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
