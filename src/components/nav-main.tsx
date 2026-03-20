// Router
import { Link, useRouter } from "@tanstack/react-router";

// Icons
import { ChevronRight, type LucideIcon } from "lucide-react";

// UI Components
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

// Types
interface NavSubItem {
  title: string;
  url: string;
}

interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: NavSubItem[];
}

interface NavMainProps {
  items: NavItem[];
}

/**
 * Check if any sub-item in a nav group is active.
 * Uses prefix matching so that /customers/123/edit highlights the Customers group.
 */
function isGroupActive(currentPath: string, items?: NavSubItem[]): boolean {
  if (!items) return false;

  return items.some((subItem) => {
    // Exact match
    if (currentPath === subItem.url) return true;

    // Prefix match for nested routes (e.g., /customers/123 matches /customers group)
    if (subItem.url !== "/" && currentPath.startsWith(subItem.url + "/")) {
      return true;
    }

    return false;
  });
}

export function NavMain({ items }: NavMainProps) {
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const groupActive = isGroupActive(currentPath, item.items);

          return (
            <Collapsible
              key={item.title}
              defaultOpen={groupActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger
                  render={
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={groupActive}
                    />
                  }
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      // Sub-items use exact matching only
                      const subItemActive = currentPath === subItem.url;

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            render={<Link to={subItem.url} />}
                            isActive={subItemActive}
                          >
                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
