// Icons
import {
  BarChart3,
  CalendarCheck,
  CreditCard,
  FileText,
  LayoutDashboard,
  ListChecks,
  Package,
  PlaneTakeoff,
  Settings,
  Stamp,
  Truck,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

// Types

/**
 * Business type the tenant operates as. Drives which nav items / sub-items
 * are shown — e.g. a Solo Agent doesn't need Team Members, and only a
 * Hajj/Umrah operator needs the Groups module.
 */
export type AgencyType = "travel_agency" | "solo_agent" | "hajj_umrah";

export interface SidebarNavSubItem {
  title: string;
  url: string;
  /** If set, this sub-item only shows for the listed agency types. Omit to show for all. */
  visibleFor?: AgencyType[];
}

export interface SidebarNavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: SidebarNavSubItem[];
  /** If set, this top-level item only shows for the listed agency types. Omit to show for all. */
  visibleFor?: AgencyType[];
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
 * Master nav list — unfiltered, contains every item across all three
 * agency types. Use `getNavItems(agencyType)` (below) to get the
 * filtered list to actually render for a tenant.
 *
 * Changes from the previous version:
 * - Orders: added Enquiries + Quotations sub-items to preserve the sales
 *   pipeline (Enquiry -> Quotation -> Booking) instead of one flat list.
 * - Suppliers: added Supplier Bills + Supplier Ledger — procurement now
 *   has a transaction trail, not just master data.
 * - Packages: added "Rate Cards & Contracts" — negotiated net rates live here.
 * - Finance: split "Balance" into Customer Ledger / Supplier Ledger, added
 *   Commission, and folded Service Charges in here (was its own top-level
 *   item — moved in to reduce top-level count).
 * - New top-level items: Tasks (ops follow-ups), Reports (Revenue / Booking
 *   Status / Supplier & Agent Performance), Groups (Hajj/Umrah only — room
 *   allocation, Moallim assignment, manifest export).
 * - Settings: Team Members + Roles & Permissions hidden for Solo Agent.
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
      { title: "Supplier Bills", url: "/suppliers/bills" },
      { title: "Supplier Ledger", url: "/suppliers/ledger" },
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
      { title: "Rate Cards & Contracts", url: "/packages/rate-cards" },
    ],
  },
  {
    title: "Orders",
    url: "#",
    icon: CalendarCheck,
    items: [
      { title: "Enquiries", url: "/orders/enquiries" },
      { title: "Quotations", url: "/orders/quotations" },
      { title: "All Bookings", url: "/orders" },
      { title: "New Booking", url: "/orders/create" },
    ],
  },
  {
    title: "Groups",
    url: "#",
    icon: UsersRound,
    visibleFor: ["hajj_umrah"],
    items: [
      { title: "All Groups", url: "/groups" },
      { title: "Add Group", url: "/groups/create" },
      { title: "Room Allocation", url: "/groups/rooms" },
      { title: "Moallim Assignment", url: "/groups/moallim" },
      { title: "Manifest Export", url: "/groups/manifest" },
    ],
  },
  {
    title: "Tasks",
    url: "#",
    icon: ListChecks,
    items: [
      { title: "My Tasks", url: "/tasks" },
      { title: "All Tasks", url: "/tasks/all", visibleFor: ["travel_agency", "hajj_umrah"] },
      { title: "New Task", url: "/tasks/create" },
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
      { title: "Service Charges", url: "/finance/service-charges" },
      { title: "Customer Ledger", url: "/finance/customer-ledger" },
      { title: "Supplier Ledger", url: "/finance/supplier-ledger" },
      { title: "Commission", url: "/finance/commission", visibleFor: ["travel_agency", "hajj_umrah"] },
    ],
  },
  {
    title: "Reports",
    url: "#",
    icon: BarChart3,
    items: [
      { title: "Revenue", url: "/reports/revenue" },
      { title: "Booking Status", url: "/reports/bookings" },
      { title: "Supplier Performance", url: "/reports/suppliers" },
      { title: "Agent Performance", url: "/reports/agents", visibleFor: ["travel_agency", "hajj_umrah"] },
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
      { title: "Team Members", url: "/settings/team", visibleFor: ["travel_agency", "hajj_umrah"] },
      { title: "Roles & Permissions", url: "/settings/roles", visibleFor: ["travel_agency", "hajj_umrah"] },
      { title: "Invoice Settings", url: "/settings/invoice" },
      { title: "Plan & Billing", url: "/settings/plan" },
    ],
  },
];