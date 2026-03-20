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

// Types
import type { Supplier, ServiceType } from "@/features/suppliers/types";

export const Route = createFileRoute("/suppliers/")({
  component: SuppliersPage,
});

// Mock data for demonstration (remove when API is connected)
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

  // TODO: Replace mock data with API call when backend is ready
  // const { data, isLoading } = useSuppliers(page, pageSize);
  const isLoading = false;
  const suppliers = mockSuppliers;
  const total = mockSuppliers.length;

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
      align: "center",
    },
    {
      key: "name",
      title: "Supplier Name",
      sortable: true,
    },
    {
      key: "contactPersonName",
      title: "Contact Person",
      width: 160,
    },
    {
      key: "contactPersonPhone",
      title: "Phone",
      width: 140,
    },
    {
      key: "serviceTypes",
      title: "Services",
      width: 160,
      render: (_, record) => renderServiceTypes(record.serviceTypes),
    },
    {
      key: "actions",
      title: "Actions",
      width: 120,
      align: "center",
      render: () => (
        <div className="flex items-center justify-center gap-1">
          {/* TODO: Add edit functionality when $supplierId route is created */}
          {/* TODO: Add DeleteSupplierButton when delete functionality is needed */}
          <span className="text-xs text-muted-foreground">Coming soon</span>
        </div>
      ),
    },
  ];

  // Add S.No to data
  const dataWithSno = suppliers.map((supplier, index) => ({
    ...supplier,
    sno: (page - 1) * pageSize + index + 1,
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
