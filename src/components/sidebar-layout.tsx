// UI Components
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Feature Components
import type { BreadcrumbEntry } from "@/components/shared/PageHeader";

// Types
interface SidebarLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbEntry[];
}

export default function SidebarLayout({
  children,
  breadcrumbs = [],
}: SidebarLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader breadcrumbs={breadcrumbs} />
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
