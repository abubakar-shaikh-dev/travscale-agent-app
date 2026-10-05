// React
import { StrictMode, useEffect, useState } from "react";
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
 *
 * The persisted store rehydrates asynchronously, so the first render would
 * otherwise evaluate every route guard against an empty session and bounce a
 * signed-in user to login on a hard refresh. Hold rendering until hydration
 * has finished (one frame in practice).
 */
function InnerApp() {
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated());
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore(selectUser);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    // Safety net: with a synchronous storage, hydration can complete in a
    // microtask between the first render and this effect, so the callback
    // above would never fire again.
    void Promise.resolve().then(() => {
      if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    });
    return unsub;
  }, []);

  if (!hydrated) return null;

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
