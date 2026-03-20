"use client";

// React
import * as React from "react";

// Router
import { Link, useRouter } from "@tanstack/react-router";

// Icons
import {
  Bell,
  CalendarCheck,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Stamp,
  Truck,
  Users,
} from "lucide-react";

// UI Components
import { Logo } from "@/components/logo";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { SidebarSearch } from "@/components/sidebar-search";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Admin",
    email: "admin@travscale.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Customers",
      url: "#",
      icon: Users,
      items: [
        {
          title: "All Customers",
          url: "/customers",
        },
        {
          title: "Add Customer",
          url: "/customers/create",
        },
      ],
    },
    {
      title: "Suppliers",
      url: "#",
      icon: Truck,
      items: [
        {
          title: "All Suppliers",
          url: "/suppliers",
        },
        {
          title: "Add Supplier",
          url: "/suppliers/new",
        },
      ],
    },
    {
      title: "Packages",
      url: "#",
      icon: Package,
      items: [
        {
          title: "All Packages",
          url: "/packages",
        },
        {
          title: "Add Package",
          url: "/packages/new",
        },
        {
          title: "Categories",
          url: "/packages/categories",
        },
      ],
    },
    {
      title: "Orders",
      url: "#",
      icon: CalendarCheck,
      items: [
        {
          title: "All Orders",
          url: "/orders",
        },
        {
          title: "New Order",
          url: "/orders/new",
        },
      ],
    },
    {
      title: "Service Charges",
      url: "#",
      icon: Stamp,
      items: [
        {
          title: "Charge History",
          url: "/service-charges",
        },
        {
          title: "Audit Log",
          url: "/service-charges/audit-log",
        },
      ],
    },
    {
      title: "Documents",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "All Documents",
          url: "/documents",
        },
        {
          title: "Upload Document",
          url: "/documents/upload",
        },
      ],
    },
    {
      title: "Finance",
      url: "#",
      icon: CreditCard,
      items: [
        {
          title: "Invoices",
          url: "/finance/invoices",
        },
        {
          title: "Payments",
          url: "/finance/payments",
        },
        {
          title: "Balance",
          url: "/finance/balance",
        },
      ],
    },
    {
      title: "Notifications",
      url: "#",
      icon: Bell,
      items: [
        {
          title: "Templates",
          url: "/notifications/templates",
        },
        {
          title: "Sent Log",
          url: "/notifications/log",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Company Profile",
          url: "/settings/company",
        },
        {
          title: "Preferences",
          url: "/settings/preferences",
        },
        {
          title: "Team Members",
          url: "/settings/team",
        },
        {
          title: "Roles & Permissions",
          url: "/settings/roles",
        },
        {
          title: "Invoice Settings",
          url: "/settings/invoice",
        },
        {
          title: "Plan & Billing",
          url: "/settings/plan",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const isDashboardActive = currentPath === "/";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link to="/" />}
              className="group-data-[collapsible=icon]:p-0! hover:bg-transparent active:bg-transparent"
            >
              {state === "expanded" ? (
                <Logo variant="full" className="h-6.5 w-auto" />
              ) : (
                <div className="flex w-full justify-center">
                  <Logo variant="icon" className="size-6.5" />
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarSearch />
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Dashboard Link */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link to="/" />}
                tooltip="Dashboard"
                isActive={isDashboardActive}
              >
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Main Navigation */}
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
