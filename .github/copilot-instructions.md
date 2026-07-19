# Feature-Sliced Design for Travscale — Production Guide

Companion to `copilot-instructions.md`. That file states the rules. This file shows
why each rule exists, where the adapted version diverges from canonical FSD, and
exactly what the code looks like when you follow it under real constraints
(cross-feature data, immutable records, polymorphic relations, route-level prefetch).

---

## 1. Canonical FSD vs. the Travscale-adapted version

Canonical Feature-Sliced Design has six layers, top to bottom:

```
app → pages → widgets → features → entities → shared
```

Each layer may only import from layers below it. Your adapted version compresses
this into five folders:

| Canonical layer | Travscale folder            | What got compressed |
|---|---|---|
| app              | `main.tsx` / router config   | not a folder, exists implicitly |
| pages            | `routes/`                    | 1:1, no change |
| widgets          | *(none — split between `routes/` and `features/X/components`)* | composed views live wherever, not isolated |
| features         | `features/X/`                | unchanged |
| entities         | *(none — folded into `features/X/types.ts`)* | **this is the gap** |
| shared           | `components/`, `lib/`, `hooks/` | unchanged |

Folding entities into features is a reasonable simplification for a feature that
owns its data and nobody else reads it. It breaks the moment a second feature
needs to *read* (not own) that same business object. `orders` reading customer
name and passport number for an order detail page is exactly that case, and so
is `financials` reading order totals.

**The fix:** add `entities/` back, but scoped tightly — it holds the canonical
shape of a business object and a read-only display primitive, nothing else.
Ownership (CRUD, search, full management UI) stays in the owning feature.

Updated import rule:

- `routes/` → `features/`, `entities/`, `components/`, `hooks/`
- `features/X/` → `entities/`, `components/shared/`, `lib/`, `hooks/` — never another `features/Y/`
- `entities/X/` → `components/shared/`, `lib/` only — never `features/` or another `entities/`
- `components/`, `lib/`, `hooks/` → nothing above them

The rule "promote to `entities/` only when a second feature needs to read it" matters.
Don't pre-build `entities/customer` before `orders` actually needs it — a speculative
entities layer on a CRUD app is how a five-person team ends up navigating eleven
folders to find one component. Wait for the second consumer, then extract.

---

## 2. The public API rule — what actually enforces "no cross-feature imports"

A sentence in a markdown file doesn't stop an import. A missing export does.

Every feature gets a single `index.ts` that is the *only* sanctioned entry point.
Everything else in the folder is implementation detail.

```ts
// features/customers/index.ts
export { useCustomers, useCustomer, useCreateCustomer, useUpdateCustomer } from './queries'
export { customerKeys, customersQuery, customerQuery } from './queries'
export type { Customer, CreateCustomerInput, UpdateCustomerInput } from './types'
export { CustomerTable } from './components/CustomerTable'
export { CustomerForm } from './components/CustomerForm'

// Deliberately NOT exported: api.ts contents.
// Raw axios calls are an implementation detail of this feature.
// Nothing outside features/customers should ever call getCustomers() directly —
// it should always go through the query hook so caching/invalidation stays correct.
```

Consumers import from the barrel, never from a deep path:

```ts
// ✅ correct
import { useCustomer, CustomerTable } from '@/features/customers'

// ❌ banned — bypasses the public API, couples you to internal file layout
import { useCustomer } from '@/features/customers/queries'
import { getCustomer } from '@/features/customers/api'
```

This is also what makes mocking sane in tests — `vi.mock('@/features/customers')`
mocks the entire public surface in one line instead of three internal modules.

---

## 3. Anatomy of a full feature slice — `customers`

```
features/customers/
├── api.ts
├── queries.ts
├── types.ts
├── components/
│   ├── CustomerTable.tsx
│   ├── CustomerForm.tsx
│   └── customer-form.options.ts
└── index.ts
```

**`types.ts`** — the domain shape, plus derived input types instead of hand-written duplicates:

```ts
// features/customers/types.ts
export interface Customer {
  id: string
  fullName: string
  email: string
  phone: string
  passportNumber: string | null
  nationality: string
  createdAt: string
  updatedAt: string
}

export type CreateCustomerInput = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateCustomerInput = Partial<CreateCustomerInput>
```

**`lib/types.ts`** — the response envelope, shared by every feature:

```ts
// lib/types.ts
export interface ApiResponse<T> {
  data: T
  meta?: { page: number; pageSize: number; total: number }
}

export interface ApiErrorResponse {
  error: { code: string; message: string }
}
```

**`api.ts`** — raw axios calls, typed with generics, unwraps the envelope, returns plain domain types:

```ts
// features/customers/api.ts
import { axiosInstance } from '@/lib/axios'
import type { ApiResponse } from '@/lib/types'
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from './types'

export async function getCustomers(params?: { page?: number; search?: string }) {
  const { data } = await axiosInstance.get<ApiResponse<Customer[]>>('/customers', { params })
  return data
}

export async function getCustomer(id: string) {
  const { data } = await axiosInstance.get<ApiResponse<Customer>>(`/customers/${id}`)
  return data.data
}

export async function createCustomer(input: CreateCustomerInput) {
  const { data } = await axiosInstance.post<ApiResponse<Customer>>('/customers', input)
  return data.data
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  const { data } = await axiosInstance.patch<ApiResponse<Customer>>(`/customers/${id}`, input)
  return data.data
}
```

**`queries.ts`** — query key factory + `queryOptions()`. This is the part most
FSD writeups skip, and it's the part that pays off hardest in production:

```ts
// features/customers/queries.ts
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCustomers, getCustomer, createCustomer, updateCustomer } from './api'
import type { CreateCustomerInput, UpdateCustomerInput } from './types'

// Key factory: every query key for this feature derives from one source.
// Invalidating customerKeys.lists() invalidates every list variant
// (search, paginated, filtered) without you having to enumerate them.
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: { page?: number; search?: string }) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
}

// queryOptions() factories: the SAME object is consumed by useQuery in a
// component AND by queryClient.ensureQueryData in a route loader. One
// definition, two call sites, zero chance of the key and the fetcher drifting.
export function customersQuery(filters: { page?: number; search?: string } = {}) {
  return queryOptions({
    queryKey: customerKeys.list(filters),
    queryFn: () => getCustomers(filters),
  })
}

export function customerQuery(id: string) {
  return queryOptions({
    queryKey: customerKeys.detail(id),
    queryFn: () => getCustomer(id),
    enabled: !!id,
  })
}

export function useCustomers(filters: { page?: number; search?: string } = {}) {
  return useQuery(customersQuery(filters))
}

export function useCustomer(id: string) {
  return useQuery(customerQuery(id))
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCustomerInput) => createCustomer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateCustomerInput) => updateCustomer(id, input),
    onSuccess: (updated) => {
      // Write straight into the cache for that detail key — instant UI update,
      // no waiting on a refetch round trip.
      queryClient.setQueryData(customerKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}
```

---

## 4. When one feature needs another's data — the `entities/` layer

Concrete case: `OrderDetail` needs to show the customer's name and passport number.

**Wrong move:** `import { Customer } from '@/features/customers/types'` inside
`features/orders`. Even barrel-exported, this is a layering inversion — an order
is *about* a customer, not the reverse, so `orders` depending on the full
`customers` feature (which also drags in search, CRUD mutations, and the
customer management UI) is backwards. You only needed three fields.

**Correct move:** extract the read-only shape into `entities/customer/`.

```
src/
├── entities/
│   └── customer/
│       ├── types.ts            ← canonical Customer shape (re-exported by features/customers too)
│       ├── api.ts               ← getCustomerSummary(id) — lean, read-only
│       ├── queries.ts           ← useCustomerSummary(id) — read query only, no mutations
│       ├── components/
│       │   └── CustomerSummaryCard.tsx   ← dumb display, no edit affordance
│       └── index.ts
├── features/
│   ├── customers/        ← owns CRUD + search + management UI
│   └── orders/
│       └── components/OrderDetail.tsx   ← imports CustomerSummaryCard from entities/customer
```

```tsx
// entities/customer/components/CustomerSummaryCard.tsx
import type { CustomerSummary } from '../types'

interface CustomerSummaryCardProps {
  customer: CustomerSummary
}

export function CustomerSummaryCard({ customer }: CustomerSummaryCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="font-medium">{customer.fullName}</p>
      <p className="text-sm text-muted-foreground">{customer.passportNumber ?? 'No passport on file'}</p>
    </div>
  )
}
```

```tsx
// features/orders/components/OrderDetail.tsx
import { useCustomerSummary } from '@/entities/customer'
import { CustomerSummaryCard } from '@/entities/customer'
import { useOrder } from '../queries'

export function OrderDetail({ orderId }: { orderId: string }) {
  const { data: order } = useOrder(orderId)
  const { data: customer } = useCustomerSummary(order?.customerId ?? '')

  return (
    <div className="space-y-6">
      {customer && <CustomerSummaryCard customer={customer} />}
      {/* order line items, status, etc. */}
    </div>
  )
}
```

`features/customers` does **not** import from `entities/customer` — it owns the
real `Customer` type and re-exports the narrower `CustomerSummary` shape that
`entities/` consumes, keeping a single source of truth for the underlying data
while giving `entities/` a deliberately smaller public surface.

---

## 5. Stop relying on the honor system — lint the boundaries

A "What NOT to do" list in a markdown file gets forgotten under deadline
pressure. `eslint-plugin-boundaries` turns it into a CI failure.

```js
// eslint.config.js
import boundaries from 'eslint-plugin-boundaries'

export default [
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'routes', pattern: 'src/routes/*' },
        { type: 'features', pattern: 'src/features/*', capture: ['feature'] },
        { type: 'entities', pattern: 'src/entities/*', capture: ['entity'] },
        { type: 'components', pattern: 'src/components/*' },
        { type: 'lib', pattern: 'src/lib/*' },
        { type: 'hooks', pattern: 'src/hooks/*' },
      ],
    },
    rules: {
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          { from: 'routes', allow: ['features', 'entities', 'components', 'hooks', 'lib'] },
          { from: 'features', allow: ['entities', 'components', 'lib', 'hooks'] },
          { from: 'entities', allow: ['components', 'lib'] },
          { from: 'components', allow: ['lib'] },
        ],
      }],
      // blocks features/orders -> features/customers even via relative paths
      'boundaries/no-private': ['error'],
      'boundaries/no-unknown': ['error'],
    },
  },
]
```

With this in place, `import { getCustomer } from '@/features/customers/api'`
inside `features/orders` fails the lint step before it ever reaches review.

---

## 6. Architecture-enforced business rules — `service-charges`

The instruction "do not create UI for editing or deleting service charges" is
weak if `updateServiceCharge` exists somewhere and someone "just needs it for
one fix." Remove the capability instead of trusting nobody calls it.

```ts
// features/service-charges/api.ts
//
// Service charges are append-only ledger entries — see ADR-0007.
// There is intentionally no updateServiceCharge or deleteServiceCharge here,
// and there should never be one. Corrections happen via a new reversal entry,
// not a mutation of the original record.

import { axiosInstance } from '@/lib/axios'
import type { ApiResponse } from '@/lib/types'
import type { ServiceCharge, CreateServiceChargeInput } from './types'

export async function getServiceCharges(orderId: string) {
  const { data } = await axiosInstance.get<ApiResponse<ServiceCharge[]>>(
    `/orders/${orderId}/service-charges`
  )
  return data.data
}

export async function createServiceCharge(orderId: string, input: CreateServiceChargeInput) {
  const { data } = await axiosInstance.post<ApiResponse<ServiceCharge>>(
    `/orders/${orderId}/service-charges`,
    input
  )
  return data.data
}
```

```tsx
// features/service-charges/components/ServiceChargeTable.tsx
// Read-only by construction: no action column, no row click handler,
// no mode prop that could branch into an edit path.
export function ServiceChargeTable({ charges }: { charges: ServiceCharge[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-muted-foreground">
          <th className="py-2">Date</th>
          <th>Description</th>
          <th className="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        {charges.map((charge) => (
          <tr key={charge.id} className="border-t">
            <td className="py-2">{new Date(charge.createdAt).toLocaleDateString()}</td>
            <td>{charge.description}</td>
            <td className="text-right">{charge.amount.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

The rule lives in the shape of the code, not in a comment someone has to read
before adding a feature.

---

## 7. Polymorphic relations — `documents`

Documents attach to either a customer or an order. Model the relation as a
discriminated union so the compiler — not a runtime check — enforces that you
always pass both `ownerType` and a matching `ownerId`.

```ts
// features/documents/types.ts
export type DocumentOwner =
  | { ownerType: 'customer'; ownerId: string }
  | { ownerType: 'order'; ownerId: string }

export interface Document {
  id: string
  fileName: string
  mimeType: string
  s3Key: string
  sizeBytes: number
  uploadedAt: string
  owner: DocumentOwner
}
```

```ts
// features/documents/api.ts
import { axiosInstance } from '@/lib/axios'
import type { ApiResponse } from '@/lib/types'
import type { Document, DocumentOwner } from './types'

export async function getDocumentsFor(owner: DocumentOwner) {
  const { data } = await axiosInstance.get<ApiResponse<Document[]>>('/documents', {
    params: { ownerType: owner.ownerType, ownerId: owner.ownerId },
  })
  return data.data
}
```

```ts
// features/documents/queries.ts
import { queryOptions, useQuery } from '@tanstack/react-query'
import { getDocumentsFor } from './api'
import type { DocumentOwner } from './types'

export const documentKeys = {
  all: ['documents'] as const,
  // owner type AND id both in the key — a customer's docs and an order's
  // docs never collide in the cache even if the ids happen to overlap.
  forOwner: (owner: DocumentOwner) => [...documentKeys.all, owner.ownerType, owner.ownerId] as const,
}

export function documentsForOwnerQuery(owner: DocumentOwner) {
  return queryOptions({
    queryKey: documentKeys.forOwner(owner),
    queryFn: () => getDocumentsFor(owner),
  })
}

export function useDocumentsFor(owner: DocumentOwner) {
  return useQuery(documentsForOwnerQuery(owner))
}
```

One component, two call sites, both type-checked:

```tsx
<DocumentList owner={{ ownerType: 'order', ownerId: order.id }} />
<DocumentList owner={{ ownerType: 'customer', ownerId: customer.id }} />
```

---

## 8. Thin routes with loader prefetch — no duplicated query logic

This is the other half of why `queryOptions()` factories matter. The route
loader and the component read the exact same object — there's no second copy
of the query key to drift out of sync.

```tsx
// routes/customers/$customerId.tsx

// Router
import { createFileRoute } from '@tanstack/react-router'

// Feature Components
import { CustomerDetailView } from '@/features/customers'

// Hooks
import { customerQuery } from '@/features/customers'

export const Route = createFileRoute('/customers/$customerId')({
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(customerQuery(params.customerId)),
  component: CustomerDetailRoute,
})

function CustomerDetailRoute() {
  const { customerId } = Route.useParams()
  return <CustomerDetailView customerId={customerId} />
}
```

Eighteen lines, no business logic, and the customer record is already in the
cache by the time `CustomerDetailView` mounts its own `useCustomer(customerId)` —
same key, instant cache hit, no loading flash.

---

## 9. Shared UI wrapper — `StatusBadge` (cva over a Shadcn primitive)

```tsx
// components/shared/StatusBadge.tsx
import { cva, type VariantProps } from 'class-variance-authority'

// UI Components
import { Badge } from '@/components/ui/badge'

// Utils
import { cn } from '@/lib/utils'

const statusBadgeVariants = cva('', {
  variants: {
    status: {
      pending: 'bg-amber-100 text-amber-800 border-amber-300',
      confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300',
    },
  },
})

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(statusBadgeVariants({ status }), className)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}
```

`components/ui/badge.tsx` stays untouched. Every status-colored badge in the
app goes through this one wrapper — change the color mapping once, it updates
everywhere.

---

## 10. Forms inside the architecture — `CustomerForm`

Wired to your existing Form UI/UX Standard: grid-2 layout, sticky bottom
actions, red-asterisk required fields, field-level Zod validation on blur
(form-level `onChange` + full Zod schema re-renders every field on every
keystroke — avoid it).

```ts
// features/customers/components/customer-form.options.ts
import { formOptions } from '@tanstack/react-form'
import { z } from 'zod'

export const customerFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone number required'),
  passportNumber: z.string().optional(),
})

export type CustomerFormData = z.infer<typeof customerFormSchema>

export const customerFormOpts = formOptions<CustomerFormData>({
  defaultValues: {
    fullName: '',
    email: '',
    phone: '',
    passportNumber: '',
  },
})
```

Extend the shared `InputField` once to support the required-asterisk rule, so
no form hand-rolls it:

```tsx
// lib/form/field-components/InputField.tsx
import { useFieldContext } from '@/lib/form/form-context'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface InputFieldProps {
  label: string
  type?: 'text' | 'email' | 'tel' | 'url' | 'password'
  required?: boolean
}

export default function InputField({ label, type = 'text', required }: InputFieldProps) {
  const field = useFieldContext<string>()
  const hasError = field.state.meta.errors.length > 0 && field.state.meta.isTouched

  return (
    <div className="space-y-1">
      <Label htmlFor={field.name}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      <Input
        id={field.name}
        value={field.state.value}
        aria-invalid={hasError}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {hasError && (
        <p className="text-sm text-destructive" role="alert">
          {field.state.meta.errors.join(', ')}
        </p>
      )}
    </div>
  )
}
```

The form itself:

```tsx
// features/customers/components/CustomerForm.tsx

// UI Components
import { Button } from '@/components/ui/button'

// Feature Components
import { customerFormOpts, customerFormSchema } from './customer-form.options'

// Hooks
import { useAppForm } from '@/lib/form/form-context'
import { useCreateCustomer, useUpdateCustomer } from '../queries'

// Types
import type { Customer } from '../types'

interface CustomerFormProps {
  customer?: Customer
  onSuccess: () => void
  onCancel: () => void
}

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer(customer?.id ?? '')

  const form = useAppForm({
    ...customerFormOpts,
    defaultValues: customer ?? customerFormOpts.defaultValues,
    onSubmit: async ({ value }) => {
      if (customer) {
        await updateCustomer.mutateAsync(value)
      } else {
        await createCustomer.mutateAsync(value)
      }
      onSuccess()
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
      className="space-y-8"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <form.AppField name="fullName" validators={{ onBlur: customerFormSchema.shape.fullName }}>
          {(field) => <field.InputField label="Full name" required />}
        </form.AppField>

        <form.AppField name="email" validators={{ onBlur: customerFormSchema.shape.email }}>
          {(field) => <field.InputField label="Email" type="email" required />}
        </form.AppField>

        <form.AppField name="phone" validators={{ onBlur: customerFormSchema.shape.phone }}>
          {(field) => <field.InputField label="Phone" type="tel" required />}
        </form.AppField>

        <form.AppField name="passportNumber">
          {(field) => <field.InputField label="Passport number" />}
        </form.AppField>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <form.SubmitButton label={customer ? 'Save changes' : 'Create customer'} />
      </div>
    </form>
  )
}
```

Same form serves create and edit. The only branch is which mutation fires on
submit — everything else, including the skeleton state while editing, is
handled by `customer ?? customerFormOpts.defaultValues` and TanStack Query's
existing loading state.

---

## 11. Gotchas at scale

- **Barrel imports and tree-shaking.** Vite/Rollup handle ESM re-exports fine
  in isolation, but a route that imports a whole feature barrel just to use
  one component still pulls the module graph for evaluation purposes in dev.
  TanStack Router's file-based routing already code-splits per route, so this
  rarely bites — but don't import a feature barrel from `main.tsx` or any
  shared layout that mounts on every page.
- **Premature `entities/`.** Don't extract until a second feature actually
  reads the data. One consumer is not a pattern, it's just where the code
  happens to live.
- **`boundaries/no-private` will flag legitimate same-feature relative
  imports** (e.g. `CustomerTable.tsx` importing `../types`) if your element
  patterns aren't scoped correctly — test the eslint config against one real
  feature before rolling it out repo-wide.
- **Query key factories drift if someone hand-writes a key instead of using
  the factory.** Code-review for `queryKey: ['customers', ...]` written
  inline anywhere outside `queries.ts` — that's the factory being bypassed.

---

## 12. Reference tree (with `entities/` added)

```
src/
├── routes/                        ← thin, loader prefetch only
├── entities/
│   └── customer/                  ← read-only shape + display primitive, shared by 2+ features
│       ├── types.ts
│       ├── api.ts
│       ├── queries.ts
│       ├── components/
│       └── index.ts
├── features/
│   ├── customers/                 ← owns Customer CRUD
│   ├── orders/                    ← consumes entities/customer
│   ├── service-charges/           ← no update/delete exports, ever
│   ├── suppliers/
│   ├── packages/
│   ├── documents/                 ← polymorphic owner typing
│   ├── financials/
│   └── notifications/
├── components/
│   ├── ui/                        ← Shadcn, untouched
│   └── shared/                    ← StatusBadge and other cva wrappers
├── lib/
│   ├── axios.ts
│   ├── types.ts                   ← ApiResponse<T> / ApiErrorResponse
│   ├── utils.ts
│   └── form/
│       ├── form-context.ts
│       ├── field-components/
│       └── form-components/
└── hooks/
```