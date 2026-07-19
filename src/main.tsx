// React
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Router
import { createRouter, RouterProvider } from "@tanstack/react-router";

// Query
import { QueryClientProvider } from "@tanstack/react-query";

// Toast
import { Toaster } from "sonner";

// Lib
import { routeTree } from "./routeTree.gen";
import { queryClient } from "./lib/query-client";
import {
  selectIsAuthenticated,
  selectUser,
  useAuthStore,
} from "./lib/auth-store";
import type { RouterContext } from "./lib/router-context";

// Styles
import "@fontsource-variable/inter/index.css";
import "./index.css";

const router = createRouter({
  routeTree,
  context: { auth: { isAuthenticated: false, user: null } },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

/**
 * Reads auth state from the Zustand store and feeds it into the router context
 * on every render. Keeping this in a child component (instead of inline in the
 * root render) lets us subscribe to the store reactively so guards re-evaluate
 * when the session changes.
 */
function InnerApp() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore(selectUser);

  const context: RouterContext = {
    auth: { isAuthenticated, user },
  };

  return <RouterProvider router={router} context={context} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <InnerApp />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </StrictMode>
);
