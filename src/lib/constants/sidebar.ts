// Icons
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Settings,
  Settings2,
  TrendingUp,
  Users,
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

export const SIDEBAR_GROUP_LABEL = "Platform";

export const SIDEBAR_DASHBOARD_ITEM: SidebarNavItem = {
  title: "Dashboard",
  url: "/",
  icon: LayoutDashboard,
};

/**
 * Master nav list — unfiltered, contains every item. Use
 * `getNavItems(agencyType)` to get the filtered list to render for a tenant.
 *
 * Information architecture:
 * - Dashboard: command center
 * - CRM: unified directory of B2C travelers & B2B sub-agents
 * - Sales: pre-booking & quoting engine (Enquiry -> Itinerary/Quote -> Booking)
 * - Operations: post-booking execution (visas, documents, tasks)
 * - Finance: money & ledgers (invoices, customer ledger, sub-agent settlements)
 * - Reports: analytics
 * - Settings: company, integrations, team, billing
 */
export const NAV_MAIN_ITEMS: SidebarNavItem[] = [
  {
    title: "CRM",
    url: "#",
    icon: Users,
    items: [
      { title: "All Contacts", url: "/contacts" },
      { title: "Add New Contact", url: "/contacts/create" },
    ],
  },
  {
    title: "Sales",
    url: "#",
    icon: TrendingUp,
    items: [
      { title: "Enquiries", url: "/sales/enquiries" },
      { title: "Itineraries & Quotes", url: "/sales/itineraries" },
      { title: "Bookings", url: "/sales/bookings" },
      { title: "Packages", url: "/sales/packages" },
    ],
  },
  {
    title: "Operations",
    url: "#",
    icon: Settings2,
    items: [
      { title: "Visa Applications", url: "/operations/visas" },
      { title: "Documents", url: "/operations/documents" },
      { title: "Tasks", url: "/operations/tasks" },
    ],
  },
  {
    title: "Finance",
    url: "#",
    icon: CreditCard,
    items: [
      { title: "Invoices & Payments", url: "/finance/invoices" },
      { title: "Customer Ledger", url: "/finance/customer-ledger" },
      { title: "Sub-Agent Settlements", url: "/finance/sub-agents" },
      { title: "Suppliers & Bills", url: "/finance/suppliers" },
    ],
  },
  {
    title: "Reports",
    url: "#",
    icon: BarChart3,
    items: [
      { title: "Sales Overview", url: "/reports/sales" },
      { title: "Booking Status", url: "/reports/bookings" },
    ],
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    items: [
      { title: "Company Profile", url: "/settings/company" },
      { title: "Integrations", url: "/settings/integrations" },
      { title: "Team Members", url: "/settings/team" },
      { title: "Plan & Billing", url: "/settings/billing" },
    ],
  },
];