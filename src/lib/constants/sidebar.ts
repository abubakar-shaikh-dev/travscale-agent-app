// Icons
import {
  CalendarCheck,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  PlaneTakeoff,
  Receipt,
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
 * Follows the SaaS UX principle of keeping primary nav task-oriented.
 * 11 items is above the 5–7 guideline but justified for a daily-use
 * power-user ops tool — revisit once onboarding moves past design partners.
 */
export const NAV_MAIN_ITEMS: SidebarNavItem[] = [
  {
    title: "Customers",
    url: "#",
    icon: Users,
    items: [
      { title: "All Customers", url: "/customers" },
      { title: "Add Customer", url: "/customers/create" },
    ],
  },
  {
    title: "Suppliers",
    url: "#",
    icon: Truck,
    items: [
      { title: "All Suppliers", url: "/suppliers" },
      { title: "Add Supplier", url: "/suppliers/create" },
    ],
  },
  {
    title: "Passengers",
    url: "#",
    icon: PlaneTakeoff,
    items: [
      { title: "All Passengers", url: "/passengers" },
      { title: "Add Passenger", url: "/passengers/create" },
    ],
  },
  {
    title: "Visa Applications",
    url: "#",
    icon: Stamp,
    items: [
      { title: "All Applications", url: "/visa-applications" },
      { title: "New Application", url: "/visa-applications/create" },
    ],
  },
  {
    title: "Packages",
    url: "#",
    icon: Package,
    items: [
      { title: "All Packages", url: "/packages" },
      { title: "Add Package", url: "/packages/create" },
      { title: "Categories", url: "/packages/categories" },
    ],
  },
  {
    title: "Orders",
    url: "#",
    icon: CalendarCheck,
    items: [
      { title: "All Orders", url: "/orders" },
      { title: "New Order", url: "/orders/create" },
    ],
  },
  {
    title: "Service Charges",
    url: "#",
    icon: Receipt,
    items: [
      { title: "Charge History", url: "/service-charges" },
    ],
  },
  {
    title: "Documents",
    url: "#",
    icon: FileText,
    items: [
      { title: "All Documents", url: "/documents" },
      { title: "Upload Document", url: "/documents/upload" },
    ],
  },
  {
    title: "Finance",
    url: "#",
    icon: CreditCard,
    items: [
      { title: "Invoices", url: "/finance/invoices" },
      { title: "Payments", url: "/finance/payments" },
      { title: "Balance", url: "/finance/balance" },
    ],
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    items: [
      { title: "Company Profile", url: "/settings/company" },
      { title: "Preferences", url: "/settings/preferences" },
      { title: "Notification Preferences", url: "/settings/notifications" },
      { title: "Team Members", url: "/settings/team" },
      { title: "Roles & Permissions", url: "/settings/roles" },
      { title: "Invoice Settings", url: "/settings/invoice" },
      { title: "Plan & Billing", url: "/settings/plan" },
    ],
  },
];