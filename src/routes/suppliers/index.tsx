// React
import { useState } from "react";

// Router
import { createFileRoute, Link } from "@tanstack/react-router";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SidebarLayout from "@/components/sidebar-layout";

// Icons
import {
  BusIcon,
  FileTextIcon,
  HotelIcon,
  PlaneIcon,
  PlusIcon,
  ShieldIcon,
} from "lucide-react";

// Feature Components
import PageHeader from "@/components/shared/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { RowActionButtons } from "@/components/shared/RowActionButtons";
import { DeleteSupplierButton } from "@/features/suppliers/components/DeleteSupplierButton";

// Hooks
import { useSuppliers } from "@/features/suppliers/queries";

// Types
import type { Supplier, ServiceType } from "@/features/suppliers/types";

export const Route = createFileRoute("/suppliers/")({
  component: SuppliersPage,
});

function SuppliersPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data: suppliers = [], isLoading } = useSuppliers();
  const total = suppliers.length;
  const pageStart = (page - 1) * pageSize;
  const paginatedSuppliers = suppliers.slice(pageStart, pageStart + pageSize);

  const renderServiceTypes = (serviceTypes: ServiceType[]) => {
    const serviceConfig: Record<
      ServiceType,
      { label: string; icon: React.ReactNode }
    > = {
      visa: { label: "Visa", icon: <ShieldIcon className="size-3" /> },
      passport: {
        label: "Passport",
        icon: <FileTextIcon className="size-3" />,
      },
      hotels: { label: "Hotels", icon: <HotelIcon className="size-3" /> },
      bus: { label: "Bus", icon: <BusIcon className="size-3" /> },
      flight: { label: "Flight", icon: <PlaneIcon className="size-3" /> },
    };

    return (
      <div className="flex gap-1">
        {serviceTypes.map((type) => {
          const service = serviceConfig[type];

          return (
            <Badge
              key={type}
              variant="secondary"
              className="text-xs flex items-center gap-1"
            >
              {service.icon}
              {service.label}
            </Badge>
          );
        })}
      </div>
    );
  };

  const columns: DataTableColumn<Supplier & { sno: number }>[] = [
    {
      key: "sno",
      title: "S.No",
      width: 70,
      minWidth: 56,
      align: "center",
    },
    {
      key: "name",
      title: "Supplier Name",
      sortable: true,
      minWidth: 160,
      ellipsis: true,
    },
    {
      key: "contactPersonName",
      title: "Contact Person",
      width: 160,
      minWidth: 130,
      ellipsis: true,
    },
    {
      key: "contactPersonPhone",
      title: "Phone",
      width: 140,
      minWidth: 120,
    },
    {
      key: "serviceTypes",
      title: "Services",
      width: 160,
      minWidth: 140,
      render: (_, record) => renderServiceTypes(record.serviceTypes),
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
              to="/suppliers/$supplierId/edit"
              params={{ supplierId: record.id }}
            />
          }
          editLabel={`Edit ${record.name}`}
          deleteAction={<DeleteSupplierButton supplier={record} />}
        />
      ),
    },
  ];

  // Add S.No to data
  const dataWithSno = paginatedSuppliers.map((supplier, index) => ({
    ...supplier,
    sno: pageStart + index + 1,
  }));

  return (
    <SidebarLayout
      breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Suppliers" }]}
    >
      <PageHeader
        title="Suppliers"
        description="Manage supplier partners across visa, passport, transport, and stay services"
        actions={
          <Button render={<Link to="/suppliers/create" />}>
            <PlusIcon />
            Add Supplier
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
