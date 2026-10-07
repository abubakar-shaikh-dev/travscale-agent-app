"use client";

// UI Components
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

// Feature Components
import {
  PageHeaderBreadcrumbs,
  type BreadcrumbEntry,
} from "@/components/shared/PageHeader";
import { UserMenu } from "@/components/shared/UserMenu";

// Types
interface AppHeaderProps {
  breadcrumbs?: BreadcrumbEntry[];
}

/**
 * Sticky application top bar.
 * Left: sidebar toggle + breadcrumbs. Right: user account menu.
 */
export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md transition-[height] duration-200 [transition-timing-function:var(--motion-ease-out)] group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <SidebarTrigger className="-ml-1 size-8" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="min-w-0 flex-1 overflow-hidden">
        <PageHeaderBreadcrumbs breadcrumbs={breadcrumbs} />
      </div>
      <UserMenu />
    </header>
  );
}
