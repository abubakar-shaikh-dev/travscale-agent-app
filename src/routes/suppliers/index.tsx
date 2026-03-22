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

// Mock data for demonstration (shown when API has no data yet)
const mockSuppliers: Supplier[] = [
  {
    id: "1",
    name: "Al-Rashid Travel Services",
    contactPersonName: "Ahmed Al-Rashid",
    contactPersonPhone: "+971 4 123 4567",
    whatsappNumber: "+971 50 123 4567",
    contactPersonEmail: "ahmed@alrashidtravel.com",
    website: "https://www.alrashidtravel.com",
    address: "Suite 201, Business Bay Tower, Dubai, UAE",
    serviceTypes: ["visa", "flight", "hotels"],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Gulf Visa Solutions",
    contactPersonName: "Sarah Al-Mansoori",
    contactPersonPhone: "+971 4 234 5678",
    whatsappNumber: "+971 50 234 5678",
    contactPersonEmail: "sarah@gulfvisasolutions.com",
    address: "Office 105, Trade Center, Abu Dhabi, UAE",
    serviceTypes: ["visa", "passport"],
    createdAt: "2024-01-16T14:20:00Z",
    updatedAt: "2024-01-16T14:20:00Z",
  },
  {
    id: "3",
    name: "Emirates Insurance Group",
    contactPersonName: "Mohammed Hassan",
    contactPersonPhone: "+971 4 345 6789",
    whatsappNumber: "+971 50 345 6789",
    contactPersonEmail: "mohammed@emiratesinsurance.ae",
    website: "https://www.emiratesinsurance.ae",
    address: "Ground Floor, Financial District, Dubai, UAE",
    serviceTypes: ["flight", "bus"],
    createdAt: "2024-01-17T09:15:00Z",
    updatedAt: "2024-01-17T09:15:00Z",
  },
  {
    id: "4",
    name: "Quick Visa Express",
    contactPersonName: "Fatima Al-Zahra",
    contactPersonPhone: "+971 4 456 7890",
    whatsappNumber: "+971 50 456 7890",
    contactPersonEmail: "fatima@quickvisaexpress.com",
    address: "Mezzanine Floor, City Center, Sharjah, UAE",
    serviceTypes: ["visa", "passport", "bus"],
    createdAt: "2024-01-18T16:45:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "5",
    name: "Secure Travel Insurance",
    contactPersonName: "Khalid Al-Mahmoud",
    contactPersonPhone: "+971 4 567 8901",
    whatsappNumber: "+971 50 567 8901",
    contactPersonEmail: "khalid@securetravel.ae",
    website: "https://www.securetravel.ae",
    address: "Level 3, Marina Walk, Dubai Marina, UAE",
    serviceTypes: ["hotels", "flight"],
    createdAt: "2024-01-19T11:00:00Z",
    updatedAt: "2024-01-19T11:00:00Z",
  },
];

function SuppliersPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data: suppliersFromApi, isLoading } = useSuppliers();
  const suppliers =
    suppliersFromApi && suppliersFromApi.length > 0
      ? suppliersFromApi
      : mockSuppliers;
  const isUsingMockData = !suppliersFromApi || suppliersFromApi.length === 0;
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
