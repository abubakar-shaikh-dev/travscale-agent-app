"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Stamp,
  Settings,
  GalleryVerticalEnd,
  Package,
  FileText,
  Truck,
  CreditCard,
  ClipboardList,
} from "lucide-react"


import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin",
    email: "admin@travscale.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "Travscale",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Clients",
      url: "#",
      icon: Users,
      items: [
        {
          title: "All Clients",
          url: "/clients",
        },
        {
          title: "Leads",
          url: "/clients/leads",
        },
      ],
    },
    {
      title: "Products",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Packages",
          url: "/products/packages",
        },
        {
          title: "Visa Services",
          url: "/products/visa-services",
        },
        {
          title: "Transport Services",
          url: "/products/transport-services",
        },
      ],
    },
    {
      title: "Bookings",
      url: "#",
      icon: CalendarCheck,
      items: [
        {
          title: "All Bookings",
          url: "/bookings",
        },
        {
          title: "New Booking",
          url: "/bookings/new",
        },
      ],
    },
    {
      title: "Applications",
      url: "#",
      icon: Stamp,
      items: [
        {
          title: "Visa Applications",
          url: "/applications/visa",
        },
        {
          title: "Passport Applications",
          url: "/applications/passport",
        },
      ],
    },
    {
      title: "Documents",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Client Documents",
          url: "/documents/clients",
        },
        {
          title: "Booking Documents",
          url: "/documents/bookings",
        },
      ],
    },
    {
      title: "Operations",
      url: "#",
      icon: Truck,
      items: [
        {
          title: "Transport Assignments",
          url: "/operations/transport-assignments",
        },
      ],
    },
    {
      title: "Billing",
      url: "#",
      icon: CreditCard,
      items: [
        {
          title: "Invoices",
          url: "/billing/invoices",
        },
        {
          title: "Payments",
          url: "/billing/payments",
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
          title: "Users",
          url: "/settings/users",
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
          title: "Master Data",
          url: "/settings/master-data",
        },
        {
          title: "Audit Logs",
          url: "/settings/audit-logs",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* Dashboard Link */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard">
                <a href="/">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </a>
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
  )
}

