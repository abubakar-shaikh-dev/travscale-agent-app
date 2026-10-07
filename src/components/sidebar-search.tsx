// UI Components
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Icons
import { Search } from "lucide-react"

// Utils
import { cn } from "@/lib/utils"

// Types
import type * as React from "react"

// Apple keyboards carry a Cmd key, everything else shows Ctrl. Resolved
// once at module load: the platform cannot change mid-session.
const IS_APPLE = /Mac|iP(hone|ad|od)/.test(navigator.userAgent)

export function SidebarSearch({
  className,
  ...props
}: React.ComponentProps<typeof SidebarMenuButton>) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Search"
          className={cn(
            "cursor-pointer gap-2 bg-sidebar-accent/50 text-sidebar-foreground shadow-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            className,
          )}
          {...props}
        >
          <Search className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground mr-auto">Search...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">{IS_APPLE ? "⌘" : "Ctrl"}</span>K
          </kbd>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
