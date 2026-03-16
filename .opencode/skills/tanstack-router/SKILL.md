---
name: tanstack-router
description: TanStack Router (React) patterns for routing, navigation, data loading, auth guards, code splitting, search params, and router context
license: MIT
compatibility: opencode
---

# TanStack Router (React) — v1 / Latest

Use this whenever working on routing, navigation, data loading, auth protection,
code splitting, search params, or route context in a React + TanStack Router project.

---

## Setup

### Installation

```bash
npm install @tanstack/react-router
npm install -D @tanstack/router-plugin @tanstack/router-devtools
```

### Vite config — router plugin MUST come before react plugin

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
  ],
});
```

### Bootstrap (main.tsx)

```tsx
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen"; // auto-generated, never edit manually

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />,
);
```

---

## File-Based Routing Conventions

```
src/routes/
├── __root.tsx              ← Root layout, always rendered
├── index.tsx               ← Matches /
├── about.tsx               ← Matches /about
├── posts/
│   ├── index.tsx           ← Matches /posts
│   ├── $postId.tsx         ← Matches /posts/:postId (dynamic)
│   └── $postId.edit.tsx    ← Matches /posts/:postId/edit
├── _auth.tsx               ← Pathless layout guard (no URL segment)
├── _auth.dashboard.tsx     ← Matches /dashboard, wrapped in _auth
├── (group)/                ← Grouping folder, ignored in URL
│   └── route.tsx           ← Layout for all siblings in this folder
├── files/$.tsx             ← Splat/wildcard, matches /files/*
└── -components/            ← Prefixed with -, ignored by router (co-location)
    └── header.tsx
```

### Naming rules

- `$paramName` → dynamic segment (e.g., `$userId.tsx`)
- `_name` prefix → pathless layout (guards, wrappers)
- `(name)` folder → grouping, no URL impact
- `route.tsx` inside folder → layout for that folder's children
- `-` prefix → co-located file, completely ignored by router
- `$.tsx` → catch-all/splat, access via `params._splat`
- `__root.tsx` → root layout, cannot be code-split

### Every route file exports Route via createFileRoute

```tsx
export const Route = createFileRoute("/posts/$postId")({
  // ...
});
```

---

## Authentication — 3 Patterns

### Pattern 1: Redirect to login page (most common)

**Step 1 — Create auth context**

```tsx
// src/auth.tsx
import { createContext, useContext, useState } from "react";

interface AuthContext {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string) => {
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setUser(data.user);
    localStorage.setItem("auth-token", data.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth-token");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!user, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
```

**Step 2 — Wire auth into router context**

```tsx
// src/routes/__root.tsx
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

interface RouterContext {
  auth: {
    isAuthenticated: boolean;
    user: User | null;
  };
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
});
```

**Step 3 — Pass auth context to router**

```tsx
// main.tsx — CRITICAL: AuthProvider must wrap RouterProvider, never the other way
function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    {" "}
    {/* ✅ AuthProvider wraps everything */}
    <InnerApp />
  </AuthProvider>,
);

// ❌ WRONG — RouterProvider can never wrap AuthProvider
// <RouterProvider><AuthProvider /></RouterProvider>
```

**Step 4 — Create the auth guard route**

```tsx
// src/routes/_auth.tsx
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href, // capture intended destination
        },
      });
    }
  },
  component: () => <Outlet />, // just pass through if authenticated
});
```

**Step 5 — Redirect back after login**

```tsx
// src/routes/login.tsx
export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (username: string, password: string) => {
    await login(username, password);
    // Use history.push NOT navigate for full URL replacement
    router.history.push(redirectTo ?? "/dashboard");
  };
  // ...
}
```

---

### Pattern 2: Inline login (modal / no redirect)

Use this when you want to show a login form in place without changing the URL.

```tsx
// src/routes/_auth.tsx
export const Route = createFileRoute("/_auth")({
  component: () => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
      return <LoginForm />; // render inline, no redirect
    }

    return <Outlet />; // user is authed, render children
  },
});
```

---

### Pattern 3: Role-based access control (RBAC)

```tsx
// src/routes/_admin.tsx
export const Route = createFileRoute("/_admin")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    if (context.auth.user?.role !== "admin") {
      throw redirect({ to: "/unauthorized" });
    }
  },
  component: () => <Outlet />,
});
```

**Per-route RBAC using context**

```tsx
// src/routes/_auth.settings.tsx
export const Route = createFileRoute("/_auth/settings")({
  beforeLoad: ({ context }) => {
    if (!context.auth.user?.permissions.includes("manage_settings")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: SettingsPage,
});
```

---

### Auth + async check (handle network errors)

```tsx
beforeLoad: async ({ context, location }) => {
  try {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  } catch (error) {
    // Only rethrow redirects — don't swallow them
    if (error instanceof Error && "isRedirect" in error) throw error;
    // Network failure: fail gracefully
    console.error("Auth check failed", error);
    throw redirect({ to: "/login" });
  }
};
```

---

### Auth performance — CRITICAL to know

`beforeLoad` runs on EVERY navigation by default. If you await an API call here,
that's a 200-300ms round trip on every link click. Fix: store auth state in React
context (checked synchronously), not server-side. Only do async token validation
on initial app load or explicit refresh — not on every navigation.

---

## Code Splitting & Lazy Loading

### The mental model

TanStack Router splits each route into two parts:

- **Critical** (must be in main bundle): `loader`, `beforeLoad`, `validateSearch`
- **Non-critical** (lazy loaded on demand): `component`, `pendingComponent`, `errorComponent`

**Never lazy-split the loader.** The loader starts fetching before the component renders.
If you split the loader, you pay the chunk download cost BEFORE the data fetch even starts —
double async penalty. Split components only.

---

### Option 1: Automatic (recommended) — just enable it

```ts
tanstackRouter({ target: "react", autoCodeSplitting: true });
```

The plugin handles everything. One critical rule: **never export** `component`,
`pendingComponent`, `errorComponent`, or `notFoundComponent` from a route file.
Exporting them pulls them into the main bundle and defeats splitting entirely.

```tsx
// ✅ Correct
export const Route = createFileRoute('/posts')({
  loader: fetchPosts,
  component: Posts,
})
function Posts() { ... }    // NOT exported ✅

// ❌ Wrong — exported component goes into main bundle
export function Posts() { ... }
```

---

### Option 2: Manual `.lazy.tsx` split (when you need explicit control)

Split a route into two files. Keep critical config in the main file, move the component
to a `.lazy.tsx` file.

```tsx
// src/routes/posts.tsx — critical config only
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/posts")({
  loader: fetchPosts,
  // no component here
});
```

```tsx
// src/routes/posts.lazy.tsx — component gets its own chunk
import { createLazyFileRoute } from '@tanstack/react-router'
export const Route = createLazyFileRoute('/posts')({
  component: Posts,
  pendingComponent: () => <Spinner />,
  errorComponent: ({ error }) => <div>{error.message}</div>,
})
function Posts() { ... }
```

If you move everything out of a route file and it's empty, delete it entirely —
a virtual route is auto-generated.

---

### Option 3: `lazyRouteComponent` for one-off splits (code-based routing)

```tsx
import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

const route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/heavy-dashboard",
  component: lazyRouteComponent(() => import("./HeavyDashboard")),
});

// Preload manually (e.g. on hover)
route.component.preload();
```

---

### Accessing route APIs from split component files

When your component lives in a separate file, use `getRouteApi` to avoid circular imports
and still get full type safety:

```tsx
// src/routes/posts/-components/PostList.tsx
import { getRouteApi } from "@tanstack/react-router";

const route = getRouteApi("/posts"); // must match exact path string

function PostList() {
  const posts = route.useLoaderData();
  const { page } = route.useSearch();
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}
```

---

### Over-splitting warning

Don't split every small route. Too many tiny chunks increases HTTP request overhead.
Group small, related routes into a single chunk. Use lazy splitting for large features
(dashboards, admin panels, heavy editors) — not every page.

---

## Data Loading (Loaders)

```tsx
// Basic
export const Route = createFileRoute("/posts")({
  loader: () => fetchPosts(),
});
function Posts() {
  const posts = Route.useLoaderData();
}

// With params
export const Route = createFileRoute("/posts/$postId")({
  loader: ({ params }) => fetchPost(params.postId),
});

// ALWAYS use loaderDeps when loader depends on search params
export const Route = createFileRoute("/posts")({
  validateSearch: z.object({ page: z.number().catch(1) }),
  loaderDeps: ({ search }) => ({ page: search.page }), // cache key
  loader: ({ deps }) => fetchPosts({ page: deps.page }),
});

// Loading + error states per route
export const Route = createFileRoute("/posts")({
  loader: fetchPosts,
  pendingComponent: () => <Spinner />,
  pendingMs: 300, // only show spinner if load takes > 300ms
  errorComponent: ({ error, reset }) => (
    <div>
      <p>{error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  ),
  staleTime: 10_000, // data is fresh for 10s
  gcTime: 60_000, // stays in cache for 60s after unmount
});
```

### Parallel loaders

Sibling routes load in parallel automatically. No action needed. The key is putting
data fetching in `loader`, NOT in the component with useEffect.

### Preloading on hover

```tsx
const router = createRouter({
  routeTree,
  defaultPreload: "intent", // preload chunk + data on hover/focus
  defaultPreloadStaleTime: 0,
});
```

---

## Search Params

```tsx
import { z } from "zod";

const schema = z.object({
  page: z.number().catch(1), // .catch() = safe default, never crashes
  filter: z.string().catch(""),
  sort: z.enum(["asc", "desc"]).catch("asc"),
});

export const Route = createFileRoute("/items")({
  validateSearch: schema,
});

function Items() {
  const { page, sort } = Route.useSearch();
  const navigate = useNavigate({ from: "/items" });

  return (
    <button
      onClick={() =>
        navigate({ search: (prev) => ({ ...prev, page: page + 1 }) })
      }
    >
      Next
    </button>
  );
}
```

### Strip defaults from URL

```tsx
import { stripSearchParams } from "@tanstack/react-router";

const router = createRouter({
  routeTree,
  search: { middlewares: [stripSearchParams({ page: 1, sort: "asc" })] },
});
```

---

## Navigation

```tsx
// Link with params and active state
<Link to="/posts/$postId" params={{ postId: post.id }}>View</Link>
<Link to="/items" search={{ page: 1 }} activeProps={{ className: 'active' }}>
  Items
</Link>

// Programmatic
const navigate = useNavigate()
navigate({ to: '/posts/$postId', params: { postId: '123' } })
navigate({ to: '/login', replace: true })
navigate({ search: prev => ({ ...prev, page: 2 }) })
```

---

## TanStack Query Integration

```tsx
const postQuery = (id: string) => queryOptions({
  queryKey: ['posts', id],
  queryFn: () => fetchPost(id),
})

// Inject queryClient via router context
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({ ... })

// Route — prefetch in loader, cache hit in component
export const Route = createFileRoute('/posts/$postId')({
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(postQuery(params.postId)),
  component: PostPage,
})

function PostPage() {
  const { postId } = Route.useParams()
  const { data } = useSuspenseQuery(postQuery(postId))  // instant — already prefetched
}
```

---

## Router Context

```tsx
interface RouterContext {
  queryClient: QueryClient
  auth: { isAuthenticated: boolean; user: User | null }
  featureFlags: Record<string, boolean>
}

export const Route = createRootRouteWithContext<RouterContext>()({ ... })

const router = createRouter({
  routeTree,
  context: { queryClient, auth, featureFlags },
})
```

Context flows to all children — use in `beforeLoad`, `loader`, and components.

---

## notFound

```tsx
// Global 404
export const Route = createRootRouteWithContext<RouterContext>()({
  notFoundComponent: () => <h1>404 — Page not found</h1>,
});

// Route-level 404 (resource doesn't exist)
export const Route = createFileRoute("/posts/$postId")({
  loader: async ({ params }) => {
    const post = await fetchPost(params.postId);
    if (!post) throw notFound();
    return post;
  },
  notFoundComponent: () => <div>Post not found</div>,
});
```

---

## Scroll Restoration

```tsx
// __root.tsx
import { Outlet, ScrollRestoration } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  ),
});
```

---

## Route Masking

Show a different URL in the browser bar than the actual route — useful for modals.

```tsx
<Link
  to="/photos/$photoId"
  params={{ photoId: photo.id }}
  mask={{ to: "/gallery" }} // URL bar shows /gallery, route is /photos/123
>
  Open Photo
</Link>
```

---

## Common Mistakes — Memorize These

| Mistake                                           | Fix                                              |
| ------------------------------------------------- | ------------------------------------------------ |
| Reading `search` directly in loader               | Use `loaderDeps` to declare deps                 |
| `useEffect + useState` for URL-driven state       | Use `validateSearch` + `useSearch`               |
| `RouterProvider` wrapping `AuthProvider`          | Flip it — `AuthProvider` wraps `RouterProvider`  |
| Exporting component from route file               | Never export — breaks `autoCodeSplitting`        |
| Splitting the loader into a lazy chunk            | Don't — loader must be synchronously available   |
| Editing `routeTree.gen.ts` manually               | Never — CLI overwrites it                        |
| Editing path string in `createFileRoute` manually | Never — router CLI manages it                    |
| Using `router.navigate` for post-login redirect   | Use `router.history.push` for full URL replace   |
| Zod schema without `.catch()` on search params    | Bad URL will crash the route                     |
| Awaiting API in `beforeLoad` on every nav         | Store auth in React context, check synchronously |
| Repeating auth logic across sibling routes        | Put it in one parent `_guard.tsx`                |
| Using `window.location` for navigation            | Always use `useNavigate` or `<Link>`             |
| Over-splitting every small route                  | Only split large features — not every page       |

---

## Quick Hooks Reference

| Hook                    | What it does                                 |
| ----------------------- | -------------------------------------------- |
| `Route.useLoaderData()` | Loader return value in route component       |
| `Route.useParams()`     | Type-safe path params                        |
| `Route.useSearch()`     | Validated search params                      |
| `useNavigate()`         | Programmatic navigation                      |
| `useRouteContext()`     | Access injected router context               |
| `useRouter()`           | Router instance (history, state, invalidate) |
| `useMatch()`            | Check if route is currently active           |
| `useLocation()`         | Current location object                      |
| `useRouterState()`      | Full router state snapshot                   |
| `getRouteApi(path)`     | Type-safe route API from split files         |

---

## Devtools

```tsx
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

{
  import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />;
}
```
