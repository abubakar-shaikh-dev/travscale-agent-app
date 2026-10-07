"use client";

// UI Components
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/menu";

// Icons
import {
  BadgeCheck,
  ChevronDown,
  CreditCard,
  LogOut,
} from "lucide-react";

// Feature Components
import { useLogout } from "@/features/auth/queries";

// Types
import type { USER_ROLES } from "@/features/auth/types";

// Utils
import { selectUser, useAuthStore } from "@/lib/auth-store";
import { useTenantStore } from "@/lib/tenant-store";
import { getInitials } from "@/lib/utils";

const ROLE_LABELS: Record<USER_ROLES, string> = {
  SUPER_ADMIN: "Super Admin",
  AGENT: "Agent",
};

/**
 * Navbar user menu — avatar trigger that opens the account dropdown.
 * Renders nothing until an authenticated user is present in the auth store.
 */
export function UserMenu() {
  const user = useAuthStore(selectUser);
  const logoutMutation = useLogout();

  if (!user) return null;

  const handleLogout = () => {
    const refresh_token = useAuthStore.getState().refresh_token;
    logoutMutation.mutate(
      { refresh_token: refresh_token ?? "" },
      {
        onSettled: () => {
          // The next sign-in may be a different agency: drop the branch
          // selection so the switcher defaults cleanly.
          useTenantStore.getState().clear();
          window.location.assign("/auth/login");
        },
      }
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="group h-auto gap-2 rounded-full py-1 pe-2.5 ps-1 hover:bg-accent/70 data-[popup-open]:bg-accent"
          />
        }
      >
        <Avatar className="size-7 rounded-full ring-1 ring-border">
          <AvatarFallback className="text-[0.6875rem] font-semibold text-muted-foreground">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-32 truncate text-sm font-medium md:block">
          {user.name}
        </span>
        <ChevronDown className="hidden size-3.5 shrink-0 text-muted-foreground/70 transition-transform duration-200 group-data-[popup-open]:rotate-180 md:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-3 px-2 py-2 text-left text-sm">
              <Avatar className="size-9 rounded-full ring-1 ring-border">
                <AvatarFallback className="text-xs font-semibold text-muted-foreground">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 gap-1">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
                <Badge
                  variant="secondary"
                  size="sm"
                  className="w-fit rounded-md"
                >
                  {ROLE_LABELS[user.role]}
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
