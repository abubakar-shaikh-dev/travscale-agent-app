// Icons
import {
  Bell,
  CalendarCheck,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  PlaneTakeoff,
  Settings,
  Stamp,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

// Types
export interface SidebarNavSubItem {
  title: string;
  url: string;
}

export interface SidebarNavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: SidebarNavSubItem[];
}

export interface SidebarUser {
  name: string;
  email: string;
  avatar: string;
}

export const SIDEBAR_GROUP_LABEL = "Platform";

export const SIDEBAR_DASHBOARD_ITEM: SidebarNavItem = {
  title: "Dashboard",
  url: "/",
  icon: LayoutDashboard,
};

/**
 * Static user data for sidebar footer.
 * TODO: Replace with authenticated user data from auth context.
 */
export const SIDEBAR_USER = {
  name: "Admin",
  email: "admin@travscale.com",
  avatar: "/avatars/admin.jpg",
} satisfies SidebarUser;

/**
 * Primary navigation items for the sidebar.
 *
 * Follows the SaaS UX principle of keeping primary nav to 5–7 core modules
 * plus settings, ordered by usage frequency for travel agents.
 */
export const NAV_MAIN_ITEMS: SidebarNavItem[] = [
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
        url: "/suppliers/create",
      },
    ],
  },
  {
    title: "Passengers",
    url: "#",
    icon: PlaneTakeoff,
    items: [
      {
        title: "All Passengers",
        url: "/passengers",
      },
      {
        title: "Add Passenger",
        url: "/passengers/create",
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
];
