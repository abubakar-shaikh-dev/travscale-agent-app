"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Stamp,
  Bus,
  Receipt,
  Settings,
  GalleryVerticalEnd,
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
          title: "Documents",
          url: "/clients/documents",
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
        {
          title: "Packages",
          url: "/bookings/packages",
        },
      ],
    },
    {
      title: "Visa & Passport",
      url: "#",
      icon: Stamp,
      items: [
        {
          title: "Visa Applications",
          url: "/visa",
        },
        {
          title: "Passport Applications",
          url: "/passport",
        },
      ],
    },
    {
      title: "Transport",
      url: "#",
      icon: Bus,
      items: [
        {
          title: "Assignments",
          url: "/transport/assignments",
        },
      ],
    },
    {
      title: "Invoices & Payments",
      url: "#",
      icon: Receipt,
      items: [
        {
          title: "Invoices",
          url: "/invoices",
        },
        {
          title: "Payments",
          url: "/payments",
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

