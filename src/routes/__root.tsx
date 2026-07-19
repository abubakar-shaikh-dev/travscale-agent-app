// Router
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

// Lib
import type { RouterContext } from "@/lib/router-context";

// UI Components
import NotFound from "@/components/NotFound";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Outlet />
    </>
  ),
  notFoundComponent: NotFound,
});
