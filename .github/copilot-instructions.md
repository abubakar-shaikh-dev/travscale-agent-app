# Travscale Agent App — Copilot Instructions

## Project Overview

This is the Travscale agent-facing SaaS dashboard (`agent.travscale.com`).
It's built for travel agents to manage customers, orders, service charges,
suppliers, packages, and documents. The backend is at `api.travscale.com`.

## Tech Stack

- Vite + React (TypeScript / TSX)
- TanStack Router (file-based routing)
- TanStack Query with Axios
- Tailwind CSS
- Shadcn/ui (components in `src/components/ui/` — never edit these files)

## Architecture: Feature-Sliced Design (adapted)

### Layers (top-level folders, strict import rules apply)

```
src/
├── routes/        ← TanStack Router file-based pages (thin, no business logic)
├── features/      ← One folder per bounded context (core business logic lives here)
├── components/    ← Shared UI only (ui/ = Shadcn, shared/ = cross-feature components)
├── lib/           ← Axios instance, Query client, utilities
└── hooks/         ← Global hooks only (auth, tenant context)
```

### Import Rules (enforce strictly)

- `routes/` can import from `features/`, `components/`, `hooks/`
- `features/X/` can import from `components/shared/`, `lib/`, `hooks/`
- `features/X/` CANNOT import from another feature (e.g. `features/orders/` cannot import from `features/customers/`)
- `components/ui/` is Shadcn territory — extend via `components/shared/`, never edit directly

### Import Organization (required)

- Keep imports grouped with a single line comment above each group.
- Preferred group order (when applicable):
  - `// React`
  - `// Router`
  - `// Query`
  - `// UI Components`
  - `// Icons`
  - `// Feature Components`
  - `// Hooks`
  - `// Constants`
  - `// Types`
  - `// Utils`
- Use only the groups that are relevant to the file.
- Keep one blank line between groups and no blank lines inside a group.
- Sort imports alphabetically within each group.
- Keep side-effect imports (if any) at the very top with `// Side Effects`.

Example:

```ts
// Icons
import { CalendarIcon, UserIcon } from "lucide-react";

// Hooks
import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";

// Constants
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
```

### Feature Folder Structure

Every bounded context in `features/` follows this shape:

```
features/customers/
├── api.ts            ← Raw axios calls only, returns typed response.data
├── queries.ts        ← TanStack Query hooks (useCustomers, useCustomer, useCreateCustomer, etc.)
├── components/       ← Components used only by this feature
│   ├── CustomerTable.tsx
│   ├── CustomerForm.tsx
│   └── CustomerCard.tsx
└── types.ts          ← TypeScript interfaces and types for this domain
```

### Bounded Contexts (features/ folders)

- `customers` — customer profiles, passport info, travel history
- `orders` — bookings, order lifecycle, status tracking
- `service-charges` — immutable append-only charge records (NEVER allow edit/delete UI)
- `suppliers` — external partner management
- `packages` — Umrah, Hajj, Holiday, Visa Run, Corporate, Custom
- `documents` — S3-backed file uploads, polymorphic (linked to customers or orders)
- `financials` — payment tracking, profit view
- `notifications` — email notification triggers

## API Conventions

- Base URL from env: `VITE_API_URL`
- All requests go through `lib/axios.ts` (has auth interceptor attached)
- All responses follow: `{ data: ..., meta: ... }` for success, `{ error: { code, message } }` for errors
- Type API responses in `features/X/types.ts` — never use `any`
- Handle errors in `queries.ts` using TanStack Query's `onError` or React error boundaries

## TypeScript Conventions

- Strict mode enabled — no `any`, no `@ts-ignore` without a comment explaining why
- Type all API responses in the feature's `types.ts`
- Use `interface` for object shapes, `type` for unions and utility types
- Axios calls typed with generics: `axios.get<ApiResponse<Customer[]>>('/customers')`
- TanStack Query hooks return properly typed data — infer from query functions, don't cast

## Code Style

- TSX throughout — no plain JS files
- Functional components with typed props interfaces
- Hooks for all state management
- Tailwind for all styling — no inline styles, no CSS modules
- Use Shadcn components from `components/ui/` as base building blocks
- No business logic in route files — delegate to feature queries and components
- Keep route files under 50 lines where possible

## Shadcn/ui Usage

- All Shadcn components live in `src/components/ui/` — installed via CLI, never manually edited
- Import directly: `import { Button } from '@/components/ui/button'`
- Use `cn()` from `lib/utils.ts` for all conditional class merging — never string concatenation
- To extend a Shadcn component, wrap it in `components/shared/`, don't modify the source
  - Example: a `StatusBadge.tsx` that wraps `<Badge>` with Travscale-specific variants
- Custom variants go on the wrapper component using `cva()` from `class-variance-authority`
- Never override Shadcn styles with inline styles — use Tailwind classes via `cn()`
- Theme tokens (colors, radius, etc.) live in `index.css` CSS variables — edit those, not the components

## Naming Conventions

- Files: PascalCase for components (`CustomerTable.tsx`), camelCase for logic (`queries.ts`, `api.ts`, `types.ts`)
- Props interfaces: `[ComponentName]Props` (e.g. `CustomerTableProps`)
- Query hooks: `use[Entity]` for lists, `use[Entity]` with id param for single, `use[Action][Entity]` for mutations
  - Examples: `useCustomers()`, `useCustomer(id)`, `useCreateCustomer()`, `useUpdateOrderStatus()`
- API functions: `get[Entity]s()`, `get[Entity](id)`, `create[Entity]()`, `update[Entity]()`

## What NOT to do

- Do not add business logic inside route files
- Do not import between feature folders directly
- Do not edit files inside `components/ui/` (Shadcn source)
- Do not use `useState` for server data — use TanStack Query
- Do not hardcode API URLs — always use the axios instance from `lib/axios.ts`
- Do not use `any` — type everything properly
- Do not create UI for editing or deleting service charges — they are immutable by design
