"use client";

// React
import * as React from "react";

// Router
import { Link, useRouter } from "@tanstack/react-router";

// UI Components
import { AgencySwitcher } from "@/components/agency-switcher";
import { Logo } from "@/components/logo";
import { NavMain } from "@/components/nav-main";
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
} from "@/components/ui/sidebar";

// Constants
import {
  NAV_MAIN_ITEMS,
  SIDEBAR_DASHBOARD_ITEM,
} from "@/lib/constants/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const DashboardIcon = SIDEBAR_DASHBOARD_ITEM.icon;
  const isDashboardActive = currentPath === SIDEBAR_DASHBOARD_ITEM.url;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AgencySwitcher />
        <SidebarSearch />
      </SidebarHeader>
      <SidebarContent className="overflow-y-scroll!">
        {/* Dashboard Link */}
        <SidebarGroup className="pb-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link to={SIDEBAR_DASHBOARD_ITEM.url} />}
                tooltip={SIDEBAR_DASHBOARD_ITEM.title}
                isActive={isDashboardActive}
                className="data-[active=true]:bg-sidebar-accent-active"
              >
                {DashboardIcon && <DashboardIcon />}
                <span>{SIDEBAR_DASHBOARD_ITEM.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Main Navigation */}
        <NavMain items={NAV_MAIN_ITEMS} />
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <div className="flex items-center justify-center">
          <Logo variant="full" className="h-4 w-auto opacity-50" />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
