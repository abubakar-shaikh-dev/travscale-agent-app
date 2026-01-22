"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BookOpen,
  Building2,
  CalendarPlus,
  CreditCard,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Receipt,
  Settings,
  Shield,
  Stamp,
  Truck,
  Users,
  UserCog,
} from "lucide-react";
import { Logo } from "@/components/logo";
import type { Route } from "./nav-main";
import DashboardNavigation from "@/components/sidebar/nav-main";
import { NotificationsPopover } from "@/components/sidebar/nav-notifications";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";

const sampleNotifications = [
  {
    id: "1",
    avatar: "/avatars/01.png",
    fallback: "NB",
    text: "New booking created.",
    time: "10m ago",
  },
  {
    id: "2",
    avatar: "/avatars/02.png",
    fallback: "VA",
    text: "Visa application approved.",
    time: "1h ago",
  },
  {
    id: "3",
    avatar: "/avatars/03.png",
    fallback: "PM",
    text: "Payment received.",
    time: "2h ago",
  },
];

const dashboardRoutes: Route[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: <LayoutDashboard className="size-4" />,
    link: "/",
  },
  {
    id: "clients",
    title: "Clients",
    icon: <Users className="size-4" />,
    link: "#",
    subs: [
      {
        title: "All Clients",
        link: "#",
        icon: <Users className="size-4" />,
      },
      {
        title: "Documents",
        link: "#",
        icon: <FolderOpen className="size-4" />,
      },
    ],
  },
  {
    id: "bookings",
    title: "Bookings",
    icon: <BookOpen className="size-4" />,
    link: "#",
    subs: [
      {
        title: "All Bookings",
        link: "#",
        icon: <BookOpen className="size-4" />,
      },
      {
        title: "New Booking",
        link: "#",
        icon: <CalendarPlus className="size-4" />,
      },
    ],
  },
  {
    id: "visa-passport",
    title: "Visa & Passport",
    icon: <Stamp className="size-4" />,
    link: "#",
    subs: [
      {
        title: "Visa Applications",
        link: "#",
        icon: <Stamp className="size-4" />,
      },
      {
        title: "Passport Applications",
        link: "#",
        icon: <FileText className="size-4" />,
      },
    ],
  },
  {
    id: "invoices-payments",
    title: "Invoices & Payments",
    icon: <Receipt className="size-4" />,
    link: "#",
    subs: [
      {
        title: "Invoices",
        link: "#",
        icon: <Receipt className="size-4" />,
      },
      {
        title: "Payments",
        link: "#",
        icon: <CreditCard className="size-4" />,
      },
    ],
  },
  {
    id: "transport",
    title: "Transport",
    icon: <Truck className="size-4" />,
    link: "#",
    subs: [
      {
        title: "Assignments",
        link: "#",
        icon: <Truck className="size-4" />,
      },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    icon: <Settings className="size-4" />,
    link: "#",
    subs: [
      {
        title: "Company Profile",
        link: "#",
        icon: <Building2 className="size-4" />,
      },
      {
        title: "Users",
        link: "#",
        icon: <UserCog className="size-4" />,
      },
      {
        title: "Roles & Permissions",
        link: "#",
        icon: <Shield className="size-4" />,
      },
      {
        title: "Invoice Settings",
        link: "#",
        icon: <Receipt className="size-4" />,
      },
    ],
  },
];

const teams = [
  { id: "1", name: "Alpha Inc.", logo: Logo, plan: "Free" },
  { id: "2", name: "Beta Corp.", logo: Logo, plan: "Free" },
  { id: "3", name: "Gamma Tech", logo: Logo, plan: "Free" },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader
        className={cn(
          "flex md:pt-3.5",
          isCollapsed
            ? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start"
            : "flex-row items-center justify-between"
        )}
      >
        <a href="#" className="flex items-center gap-2">
          <Logo className="h-6 w-auto" />
        </a>

        <motion.div
          key={isCollapsed ? "header-collapsed" : "header-expanded"}
          className={cn(
            "flex items-center gap-2",
            isCollapsed ? "flex-row md:flex-col-reverse" : "flex-row"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <NotificationsPopover notifications={sampleNotifications} />
          <SidebarTrigger />
        </motion.div>
      </SidebarHeader>
      <SidebarContent className="gap-4 px-2 py-4">
        <DashboardNavigation routes={dashboardRoutes} />
      </SidebarContent>
      <SidebarFooter className="px-2">
        <TeamSwitcher teams={teams} />
      </SidebarFooter>
    </Sidebar>
  );
}
