"use client";

// React
import * as React from "react";

// Query
import { useQueryClient } from "@tanstack/react-query";

// UI Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import { Check, ChevronsUpDown, MapPin } from "lucide-react";

// Feature Components
import { useAgencyLocations, useMyAgency } from "@/features/agencies/queries";
import { useSignedUrl } from "@/features/storage/queries";

// Hooks
import { useTenantStore } from "@/lib/tenant-store";

// Toast
import { toast } from "sonner";

// Types
import type { Agency } from "@/features/agencies/types";

// Utils
import { extractApiError } from "@/lib/api-error";
import { cn, getInitials } from "@/lib/utils";

/** One page is plenty for a picker; deeper lists belong in management UI. */
const LOCATION_LIST_LIMIT = 100;

/**
 * Sidebar identity switcher: agency logo tile + display name on the first
 * line, the active location under it. Opens the location switcher; picking a
 * location invalidates queries so location-scoped data re-resolves at once.
 * Collapses to the agency tile in icon mode (the tooltip keeps the name).
 */
export function AgencySwitcher() {
  const { isMobile, state } = useSidebar();
  const queryClient = useQueryClient();

  const activeLocationId = useTenantStore((s) => s.active_location_id);
  const setActiveLocation = useTenantStore((s) => s.setActiveLocation);

  const agencyQuery = useMyAgency();
  const agency = agencyQuery.data;
  const locationsQuery = useAgencyLocations({
    limit: LOCATION_LIST_LIMIT,
  });
  // Stable reference so the default-location effect below does not run on
  // every render while the list query is still pending.
  const locations = React.useMemo(
    () => locationsQuery.data?.items ?? [],
    [locationsQuery.data]
  );

  const hasLogo = Boolean(agency?.logo_key);
  const logoQuery = useSignedUrl(
    { key: agency?.logo_key ?? "" },
    { enabled: hasLogo }
  );

  // Default to the first location, and re-point the selection if the stored
  // id no longer exists (deleted branch, or another agency's session on a
  // shared machine).
  React.useEffect(() => {
    if (locations.length === 0) return;
    if (
      !activeLocationId ||
      !locations.some((location) => location.id === activeLocationId)
    ) {
      setActiveLocation(locations[0].id);
    }
  }, [locations, activeLocationId, setActiveLocation]);

  React.useEffect(() => {
    if (agencyQuery.isError) {
      toast.error(extractApiError(agencyQuery.error).message);
    }
  }, [agencyQuery.isError, agencyQuery.error]);

  if (agencyQuery.isPending) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex h-12 items-center gap-2 rounded-lg px-2 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!">
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <div className="grid flex-1 gap-1.5 group-data-[collapsible=icon]:hidden">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Failed loads are surfaced as a toast; the sidebar header stays empty
  // rather than showing a switcher without an agency behind it.
  if (agencyQuery.isError || !agency) {
    return null;
  }

  const initials = getInitials(agency.display_name, "A");
  const activeLocation =
    locations.find((location) => location.id === activeLocationId) ?? null;
  const locationLabel = activeLocation
    ? [activeLocation.name, activeLocation.city].filter(Boolean).join(" • ")
    : "No location";
  const collapsedPopup = !isMobile && state === "collapsed";

  const handleSwitchLocation = (locationId: string) => {
    if (locationId === activeLocationId) return;
    setActiveLocation(locationId);
    // The tenant context changed: re-resolve server data under the new
    // branch. Location-scoped queries carry the id in their keys.
    queryClient.invalidateQueries();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                tooltip={agency.display_name}
                className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <AgencyTile
              agency={agency}
              logoUrl={hasLogo ? logoQuery.data?.url : undefined}
              initials={initials}
            />
            <div className="grid min-w-0 flex-1 text-left leading-tight">
              <span className="truncate text-sm font-medium">
                {agency.display_name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {locationLabel}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-lg"
            side={collapsedPopup ? "right" : "bottom"}
            align="start"
            sideOffset={8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 px-2 py-2 text-left text-sm">
                  <AgencyTile
                    agency={agency}
                    logoUrl={hasLogo ? logoQuery.data?.url : undefined}
                    initials={initials}
                    className="size-9"
                  />
                  <div className="grid min-w-0 flex-1 gap-0.5">
                    <span className="truncate font-medium">
                      {agency.display_name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {agency.email ?? agency.legal_name}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                Locations
              </DropdownMenuLabel>
              {locations.length === 0 ? (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">
                  No locations yet.
                </p>
              ) : (
                locations.map((location) => {
                  const isActive = location.id === activeLocationId;

                  return (
                    <DropdownMenuItem
                      key={location.id}
                      onClick={() => handleSwitchLocation(location.id)}
                    >
                      <MapPin />
                      <span className="truncate">{location.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {location.city ?? location.code}
                      </span>
                      <Check
                        className={cn(
                          "size-4 shrink-0",
                          isActive ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </DropdownMenuItem>
                  );
                })
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

interface AgencyTileProps {
  agency: Agency;
  logoUrl?: string;
  initials: string;
  className?: string;
}

/**
 * The agency logo tile: the uploaded S3 logo when one exists, otherwise an
 * initials fallback. Shared by the trigger (size-8) and the dropdown header
 * (size-9).
 */
function AgencyTile({ agency, logoUrl, initials, className }: AgencyTileProps) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background",
        className
      )}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={agency.display_name}
          className="size-full object-cover"
        />
      ) : (
        <span className="text-xs font-semibold text-muted-foreground">
          {initials}
        </span>
      )}
    </div>
  );
}
