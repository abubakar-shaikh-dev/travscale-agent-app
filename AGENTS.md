# Travscale Agent App — AI Agent Instructions

## Project Overview

This is the Travscale agent-facing SaaS dashboard (`agent.travscale.com`).
It's built for travel agents to manage customers, orders, service charges,
suppliers, packages, and documents. The backend is at `api.travscale.com`.

## Tech Stack

- **Build Tool**: Vite + React 19 (TypeScript / TSX)
- **Router**: TanStack Router (file-based routing with auto code-splitting)
- **Data Fetching**: TanStack Query + Axios
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui (components in `src/components/ui/` — never edit these files)

## Package Manager & Commands

**ALWAYS use `pnpm`** — never use `npm` or `yarn`.

### Development Commands
```bash
pnpm dev              # Start dev server (default port 5173)
pnpm build            # Type-check with tsc and build for production
pnpm preview          # Preview production build locally
pnpm lint             # Run ESLint on all TypeScript files
```

### Testing
⚠️ **No test suite currently configured.** When tests are added:
- Recommended: Vitest for unit tests, Playwright/Cypress for E2E
- Run single test file: `pnpm test <file-pattern>`
- Run specific test: `pnpm test -t "test name pattern"`

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

- `routes/` can import from `features/`, `components/`, `hooks/`, `lib/`
- `features/X/` can import from `components/`, `lib/`, `hooks/`
- `features/X/` CANNOT import from another feature (e.g. `features/orders/` cannot import from `features/customers/`)
- `components/ui/` is Shadcn territory — extend via wrapper components, never edit directly

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
- Props interfaces: `interface [ComponentName]Props { ... }`

## Code Style

- TSX throughout — no plain JS files
- Functional components with typed props interfaces
- Hooks for all state management
- Tailwind for all styling — no inline styles, no CSS modules
- Use Shadcn components from `components/ui/` as base building blocks
- No business logic in route files — delegate to feature queries and components
- Keep route files under 50 lines where possible

## Form UI/UX Standard (must stay consistent)

Follow this exact form presentation pattern so all current and future forms feel identical.

- **Form Engine**: use TanStack Form via `useAppForm` from `src/lib/form/form-context.ts`
- **Field Primitives**: use registered field components (`InputField`, `PhoneField`, `SelectField`, `RadioCardField`, `CheckboxGroupField`) instead of hand-rolled inputs
- **Page Shell**: route page should use `SidebarLayout` + breadcrumb + `PageHeader` + form card container (`rounded-lg border bg-card p-6 shadow-sm`)
- **Form Rhythm**: form root should use `space-y-8`; sections use `space-y-6`; fields use `grid gap-6 sm:grid-cols-2`; wide fields span with `sm:col-span-2`
- **Actions Layout**: sticky pattern at bottom of form body: `flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end` with `Cancel` (outline) + primary submit
- **Validation UX**: prefer field-level `onBlur` validation with clear inline error text, with form `onSubmit` as safety net
- **Edit UX**: edit pages must load existing data and show a layout-matched skeleton while loading
- **Required Fields Rule**:
  - mandatory fields MUST display a red asterisk (`*`) beside label
  - optional fields MUST NOT show `(Optional)` text in labels
  - if no red asterisk is shown, the field is considered optional
  - use shared `FieldLabel`/`required` props to keep this DRY and consistent
- **DRY Rule for Forms**: centralize repeated form UI behavior in shared primitives (for example shared label rendering, shared actions, shared skeleton patterns), do not duplicate label/error/action logic per form

## Error Handling

- Let TanStack Query handle query errors automatically via error boundaries
- Use `onError` callback in mutations to display user feedback (toast notifications)
- 401 responses auto-redirect to login (handled in `lib/axios.ts` interceptor)
- Never silently catch errors — always provide user feedback or log for debugging
- Type error responses: `{ error: { code: string; message: string } }`

## Shadcn/ui Usage

- All Shadcn components live in `src/components/ui/` — installed via CLI, never manually edited
- Import directly: `import { Button } from '@/components/ui/button'`
- Use `cn()` from `lib/utils.ts` for all conditional class merging — never string concatenation
- To extend a Shadcn component, wrap it in `components/`, don't modify the source
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
