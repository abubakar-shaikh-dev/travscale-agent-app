---
name: tanstack-form
description: >
  Use this skill whenever building, modifying, or scaffolding forms with TanStack Form v1 in a React
  application — especially for complex, multi-section, or ERP-scale forms in SaaS products. Triggers:
  any mention of TanStack Form, @tanstack/react-form, createFormHook, useAppForm, withForm, 
  withFieldGroup, form composition, array fields, async validation, Zod form validation, multi-step 
  forms, ERP forms, or "form state management in React." Use for Travscale and any other projects 
  using TanStack Form.
version: "1.0 — March 2025 (TanStack Form v1)"
---

# TanStack Form SKILL — Scalable SaaS / ERP Apps

TanStack Form v1 is built for production-scale apps. It uses signals under the hood (via @tanstack/store),
which means only the field that changed re-renders — nothing else. This is the architecture you want
when a single form has 50+ fields, repeating line items, conditional sections, and async server validation.

This skill covers the complete mental model + every pattern you need for Travscale-scale complexity.

---

## 📐 Mental Model First

There are three layers:

1. **Form Instance** — owns all state. One `useAppForm()` call per form.
2. **Field** — a reactive slice of form state. Each `form.Field` or `form.AppField` subscribes only to its own slice.
3. **Field Components** — your pre-built UI primitives (InputField, SelectField, etc.) that consume field state via `useFieldContext`.

The key insight: you register your UI components once with `createFormHook`, and from that point forward every form
in your app has type-safe access to those components as `field.TextField`, `field.SelectField`, etc. No prop drilling,
no manual wiring.

---

## 🏗️ Project Structure

```
src/
├── lib/
│   └── form/
│       ├── form-context.ts        ← createFormHookContexts + createFormHook, exported once
│       ├── field-components/
│       │   ├── InputField.tsx
│       │   ├── SelectField.tsx
│       │   ├── TextareaField.tsx
│       │   ├── CheckboxField.tsx
│       │   ├── DateField.tsx
│       │   ├── NumberField.tsx
│       │   └── ComboboxField.tsx
│       └── form-components/
│           ├── SubmitButton.tsx
│           └── FormErrorBanner.tsx
├── features/
│   └── bookings/
│       ├── BookingForm.tsx         ← useAppForm() lives here
│       ├── BookingFormPassengers.tsx  ← withFieldGroup() section
│       ├── BookingFormPayment.tsx     ← withFieldGroup() section
│       └── booking-form.options.ts   ← formOptions() + Zod schema
```

---

## 🔌 Setup: form-context.ts (do this ONCE, app-wide)

```ts
// src/lib/form/form-context.ts
import { lazy } from 'react'
import { createFormHook, createFormHookContexts } from '@tanstack/react-form'

// Step 1: create contexts — these are passed into createFormHook and into every field component
export const {
  fieldContext,
  formContext,
  useFieldContext,
  useFormContext,
} = createFormHookContexts()

// Step 2: lazy-load field components for better code splitting
const InputField    = lazy(() => import('./field-components/InputField'))
const SelectField   = lazy(() => import('./field-components/SelectField'))
const TextareaField = lazy(() => import('./field-components/TextareaField'))
const CheckboxField = lazy(() => import('./field-components/CheckboxField'))
const NumberField   = lazy(() => import('./field-components/NumberField'))
const DateField     = lazy(() => import('./field-components/DateField'))

const SubmitButton     = lazy(() => import('./form-components/SubmitButton'))
const FormErrorBanner  = lazy(() => import('./form-components/FormErrorBanner'))

// Step 3: build your app-specific form hook
export const {
  useAppForm,
  withForm,
  withFieldGroup,
  useTypedAppFormContext,
} = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    InputField,
    SelectField,
    TextareaField,
    CheckboxField,
    NumberField,
    DateField,
  },
  formComponents: {
    SubmitButton,
    FormErrorBanner,
  },
})
```

> **Rule:** Import `useAppForm`, `withForm`, `withFieldGroup` ONLY from this file, never from `@tanstack/react-form` directly.

---

## 🧩 Building Field Components

Each field component uses `useFieldContext<T>()` to wire into form state.
The generic `T` is the field's value type — this drives type safety.

```tsx
// src/lib/form/field-components/InputField.tsx
import { useFieldContext } from '@/lib/form/form-context'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface InputFieldProps {
  label: string
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'url' | 'password'
  disabled?: boolean
}

export default function InputField({
  label,
  placeholder,
  type = 'text',
  disabled,
}: InputFieldProps) {
  const field = useFieldContext<string>()

  const errors = field.state.meta.errors
  const hasError = errors.length > 0 && field.state.meta.isTouched

  return (
    <div className="space-y-1">
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        placeholder={placeholder}
        value={field.state.value}
        disabled={disabled}
        aria-invalid={hasError}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {hasError && (
        <p className="text-sm text-destructive" role="alert">
          {errors.join(', ')}
        </p>
      )}
    </div>
  )
}
```

```tsx
// src/lib/form/field-components/NumberField.tsx
import { useFieldContext } from '@/lib/form/form-context'

export default function NumberField({ label }: { label: string }) {
  const field = useFieldContext<number>()
  const hasError = field.state.meta.errors.length > 0 && field.state.meta.isTouched

  return (
    <div className="space-y-1">
      <label htmlFor={field.name}>{label}</label>
      <input
        id={field.name}
        type="number"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
        aria-invalid={hasError}
      />
      {hasError && <p role="alert">{field.state.meta.errors.join(', ')}</p>}
    </div>
  )
}
```

```tsx
// src/lib/form/form-components/SubmitButton.tsx
import { useFormContext } from '@/lib/form/form-context'
import { Button } from '@/components/ui/button'

export default function SubmitButton({ label = 'Submit' }: { label?: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(s) => ({ isSubmitting: s.isSubmitting, canSubmit: s.canSubmit })}>
      {({ isSubmitting, canSubmit }) => (
        <Button type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? 'Saving...' : label}
        </Button>
      )}
    </form.Subscribe>
  )
}
```

---

## 📋 formOptions — Share Config Between Forms

Use `formOptions()` to define schema, default values, and validators in one place.
Every form that uses these opts inherits the types — critical for `withForm` and `withFieldGroup`.

```ts
// src/features/bookings/booking-form.options.ts
import { z } from 'zod'
import { formOptions } from '@tanstack/react-form'

export const bookingFormSchema = z.object({
  reference: z.string().min(1, 'Reference is required'),
  client: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Valid email required'),
    phone: z.string().min(7, 'Phone number required'),
  }),
  passengers: z.array(z.object({
    firstName: z.string().min(1, 'First name required'),
    lastName: z.string().min(1, 'Last name required'),
    passportNumber: z.string().optional(),
  })).min(1, 'At least one passenger required'),
  totalAmount: z.number().positive('Amount must be positive'),
  serviceFee: z.number().min(0),
  currency: z.string().min(1, 'Currency is required'),
})

export type BookingFormData = z.infer<typeof bookingFormSchema>

export const bookingFormOpts = formOptions<BookingFormData>({
  defaultValues: {
    reference: '',
    client: { name: '', email: '', phone: '' },
    passengers: [{ firstName: '', lastName: '', passportNumber: '' }],
    totalAmount: 0,
    serviceFee: 0,
    currency: 'USD',
  },
  validators: {
    // Field-level schema: put Zod at the field level to avoid the form-level onChange re-render bug.
    // Form-level onChange with a full Zod schema triggers ALL fields to re-render on every keystroke.
    // Use onSubmit at the form level instead.
    onSubmit: bookingFormSchema,
  },
})
```

> ⚠️ **Known gotcha:** Using a Zod schema as a form-level `onChange` validator causes all fields to re-render
> on every keystroke (tracked issue: TanStack/form#1625). Put Zod at the **field level** for onChange,
> or use `onSubmit`/`onBlur` at the form level.

---

## 🧱 Simple Form (single file, small forms)

```tsx
// src/features/service-charges/ServiceChargeForm.tsx
import { useAppForm } from '@/lib/form/form-context'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  amount: z.number().positive('Must be positive'),
  isPercentage: z.boolean(),
})

type ServiceChargeData = z.infer<typeof schema>

export function ServiceChargeForm({
  onSave,
}: {
  onSave: (data: ServiceChargeData) => Promise<void>
}) {
  const form = useAppForm({
    defaultValues: {
      name: '',
      amount: 0,
      isPercentage: false,
    } as ServiceChargeData,
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      await onSave(value)
    },
  })

  return (
    <form.AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
        className="space-y-4"
      >
        <form.AppField name="name">
          {(field) => <field.InputField label="Charge Name" />}
        </form.AppField>

        <form.AppField name="amount">
          {(field) => <field.NumberField label="Amount" />}
        </form.AppField>

        <form.AppField name="isPercentage">
          {(field) => <field.CheckboxField label="Apply as percentage?" />}
        </form.AppField>

        <form.SubmitButton label="Save Charge" />
      </form>
    </form.AppForm>
  )
}
```

---

## 🏛️ Large ERP Form: Decomposition with withForm + withFieldGroup

For large forms (booking, itinerary, invoice), split into sections.

### Step 1 — The root form

```tsx
// src/features/bookings/BookingForm.tsx
import { Suspense } from 'react'
import { useAppForm } from '@/lib/form/form-context'
import { bookingFormOpts } from './booking-form.options'
import { BookingClientSection } from './BookingClientSection'
import { BookingPassengersSection } from './BookingPassengersSection'
import { BookingFinancialsSection } from './BookingFinancialsSection'
import { useSaveBooking } from '@/hooks/useSaveBooking'

export function BookingForm({ bookingId }: { bookingId?: string }) {
  const { mutateAsync } = useSaveBooking()

  const form = useAppForm({
    ...bookingFormOpts,
    onSubmit: async ({ value }) => {
      await mutateAsync(value)
    },
  })

  return (
    <form.AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
        className="space-y-8"
      >
        <Suspense fallback={<div>Loading...</div>}>
          {/* Each section gets the form via withForm HOC — no prop drilling */}
          <BookingClientSection form={form} />
          <BookingPassengersSection form={form} />
          <BookingFinancialsSection form={form} />
        </Suspense>

        <form.FormErrorBanner />
        <form.SubmitButton label="Save Booking" />
      </form>
    </form.AppForm>
  )
}
```

### Step 2 — withForm for each section

```tsx
// src/features/bookings/BookingClientSection.tsx
import { withForm } from '@/lib/form/form-context'
import { bookingFormOpts } from './booking-form.options'

// withForm ensures this component only accepts forms that match bookingFormOpts' shape.
// It also re-renders only when the fields it renders change.
export const BookingClientSection = withForm({
  ...bookingFormOpts,
  render: function BookingClientSectionRender({ form }) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Client Details</h2>

        <form.AppField name="client.name">
          {(field) => <field.InputField label="Client Name" />}
        </form.AppField>

        <form.AppField name="client.email">
          {(field) => (
            <field.InputField
              label="Email"
              type="email"
            />
          )}
        </form.AppField>

        <form.AppField name="client.phone">
          {(field) => <field.InputField label="Phone" type="tel" />}
        </form.AppField>
      </section>
    )
  },
})
```

### Step 3 — withFieldGroup for reusable cross-form sections

Use `withFieldGroup` when a group of fields (e.g., an address block, a passenger record) 
appears in multiple different forms.

```tsx
// src/lib/form/field-groups/PassengerFields.tsx
import { withFieldGroup } from '@/lib/form/form-context'

type PassengerData = {
  firstName: string
  lastName: string
  passportNumber?: string
}

const defaultValues: PassengerData = {
  firstName: '',
  lastName: '',
  passportNumber: '',
}

// Any form that has these field keys can use this group
export const PassengerFields = withFieldGroup({
  defaultValues,
  render: function PassengerFieldsRender({ form }) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <form.AppField name="firstName">
          {(field) => <field.InputField label="First Name" />}
        </form.AppField>

        <form.AppField name="lastName">
          {(field) => <field.InputField label="Last Name" />}
        </form.AppField>

        <form.AppField name="passportNumber">
          {(field) => <field.InputField label="Passport Number" placeholder="Optional" />}
        </form.AppField>
      </div>
    )
  },
})
```

---

## 📦 Array Fields — Line Items, Passengers, Services

```tsx
// src/features/bookings/BookingPassengersSection.tsx
import { withForm } from '@/lib/form/form-context'
import { bookingFormOpts } from './booking-form.options'
import { Button } from '@/components/ui/button'

export const BookingPassengersSection = withForm({
  ...bookingFormOpts,
  render: function BookingPassengersSectionRender({ form }) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Passengers</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              form.pushFieldValue('passengers', {
                firstName: '',
                lastName: '',
                passportNumber: '',
              })
            }
          >
            + Add Passenger
          </Button>
        </div>

        <form.Field name="passengers">
          {(arrayField) =>
            arrayField.state.value.map((_, index) => (
              <div
                key={index}
                className="relative rounded-md border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Passenger {index + 1}
                  </span>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => form.removeFieldValue('passengers', index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <form.AppField name={`passengers[${index}].firstName`}>
                  {(field) => <field.InputField label="First Name" />}
                </form.AppField>

                <form.AppField name={`passengers[${index}].lastName`}>
                  {(field) => <field.InputField label="Last Name" />}
                </form.AppField>

                <form.AppField name={`passengers[${index}].passportNumber`}>
                  {(field) => (
                    <field.InputField label="Passport Number" placeholder="Optional" />
                  )}
                </form.AppField>
              </div>
            ))
          }
        </form.Field>

        {/* Form-level error on the array itself */}
        <form.Field name="passengers">
          {(field) =>
            field.state.meta.errors.length > 0 ? (
              <p className="text-sm text-destructive">
                {field.state.meta.errors.join(', ')}
              </p>
            ) : null
          }
        </form.Field>
      </section>
    )
  },
})
```

---

## ✅ Validation Patterns

### Field-level Zod (preferred — granular, no global re-render side effects)

```tsx
<form.AppField
  name="email"
  validators={{
    onChange: z.string().email('Enter a valid email'),
    onBlur: z.string().email('Enter a valid email'),
  }}
>
  {(field) => <field.InputField label="Email" />}
</form.AppField>
```

### Async validation with debounce

```tsx
<form.AppField
  name="reference"
  asyncDebounceMs={400}
  validators={{
    onChangeAsync: async ({ value }) => {
      if (!value) return undefined
      const exists = await checkReferenceExists(value)
      return exists ? 'Reference already in use' : undefined
    },
  }}
>
  {(field) => (
    <div className="space-y-1">
      <field.InputField label="Booking Reference" />
      {field.state.meta.isValidating && (
        <p className="text-xs text-muted-foreground">Checking...</p>
      )}
    </div>
  )}
</form.AppField>
```

### Cross-field validation — onChangeListenTo

```tsx
<form.AppField
  name="confirmPassword"
  validators={{
    onChangeListenTo: ['password'],
    onChange: ({ value, fieldApi }) => {
      const password = fieldApi.form.getFieldValue('password')
      return value !== password ? 'Passwords must match' : undefined
    },
  }}
>
  {(field) => <field.InputField label="Confirm Password" type="password" />}
</form.AppField>
```

### Server-side error mapping (after submit)

```ts
const form = useAppForm({
  ...formOpts,
  validators: {
    onSubmitAsync: async ({ value }) => {
      const result = await saveBooking(value)
      if (result.errors) {
        // Map server errors back to fields by field path
        return {
          form: result.errors.general ?? undefined,
          fields: {
            'client.email': result.errors.email,
            'passengers[0].passportNumber': result.errors.passport,
          },
        }
      }
      return null
    },
  },
})
```

### Dynamic validation (post-submit revalidation)

```ts
import { revalidateLogic, useForm } from '@tanstack/react-form'

const form = useAppForm({
  defaultValues: { ... },
  validationLogic: revalidateLogic(), // required to enable onDynamic
  validators: {
    onDynamic: ({ value }) => {
      if (value.isPercentage && value.amount > 100) {
        return { amount: 'Percentage cannot exceed 100' }
      }
      return undefined
    },
  },
})
```

---

## 🔭 Subscriptions — Subscribe to Only What You Need

Use `form.Subscribe` to read form state without subscribing the whole component to every change.

```tsx
// Conditionally show a section based on another field
<form.Subscribe selector={(s) => s.values.travelType}>
  {(travelType) =>
    travelType === 'international' ? (
      <form.AppField name="visaRequired">
        {(field) => <field.CheckboxField label="Visa required?" />}
      </form.AppField>
    ) : null
  }
</form.Subscribe>

// Show global dirty state indicator
<form.Subscribe selector={(s) => s.isDirty}>
  {(isDirty) =>
    isDirty ? (
      <p className="text-xs text-amber-600">You have unsaved changes</p>
    ) : null
  }
</form.Subscribe>
```

---

## ⚡ TanStack Query Integration

Wire `onSubmit` directly into a `useMutation` — no local loading state needed.

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppForm } from '@/lib/form/form-context'
import { bookingFormOpts } from './booking-form.options'
import { saveBooking } from '@/api/bookings'

export function BookingForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient()
  const { mutateAsync } = useMutation({
    mutationFn: saveBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      onSuccess()
    },
  })

  const form = useAppForm({
    ...bookingFormOpts,
    onSubmit: async ({ value }) => {
      await mutateAsync(value)
      // form resets automatically after successful submit if you add:
      // form.reset()
    },
  })

  // ... render form
}
```

For **edit forms**, pre-populate from a query:

```tsx
const { data: booking } = useSuspenseQuery({
  queryKey: ['bookings', bookingId],
  queryFn: () => fetchBooking(bookingId),
})

const form = useAppForm({
  ...bookingFormOpts,
  defaultValues: booking, // type-safe since booking matches BookingFormData
  onSubmit: async ({ value }) => { ... },
})
```

---

## 🔑 TypeScript Gotchas

### withForm type mismatch
The `withForm` HOC uses heavy generics. When TypeScript complains about mismatched form types,
the blessed workaround is:

```tsx
<BookingClientSection form={form as never} />
// or
{/* @ts-expect-error Form type mismatch — safe here */}
<BookingClientSection form={form} />
```

This is a known pain point with `withForm`. The team is aware of it. Keep your `formOptions` spread
(`...bookingFormOpts`) consistent between the parent `useAppForm` call and the `withForm` definition.

### Don't redeclare defaultValues types
Let Zod + `formOptions` own the types. Don't do this:
```ts
// ❌ manual type annotation defeats inference
const form = useAppForm<BookingFormData>({ ... })

// ✅ let TypeScript infer from defaultValues + schema
const form = useAppForm({ ...bookingFormOpts, onSubmit: ... })
```

### Field name paths are fully typed
```tsx
// ✅ autocompletes + catches typos at compile time
<form.AppField name="client.email">

// ✅ array paths too
<form.AppField name="passengers[0].firstName">
```

### useTypedAppFormContext — context fallback
Only use this when `withForm` isn't feasible (e.g., rendering inside `<Outlet />`):

```tsx
const form = useTypedAppFormContext()
```

This is a last resort. Prefer `withForm` — the context version has no type mismatch warnings.

---

## 🚫 Anti-Patterns

| ❌ Don't | ✅ Do instead |
|---|---|
| Import `useForm` directly from `@tanstack/react-form` | Import `useAppForm` from your `form-context.ts` |
| Put the full Zod schema as form-level `onChange` | Put Zod at field-level onChange, or form-level `onSubmit`/`onBlur` |
| Keep a 300-line form in one file | Use `withForm` per section |
| Manual `useState` for isSubmitting / loading | Use `form.Subscribe selector={(s) => s.isSubmitting}` |
| Drive conditional rendering from local state | Drive from `form.Subscribe selector={(s) => s.values.fieldName}` |
| Rewrite field UI logic per form | Register field components in `createFormHook`, reuse everywhere |
| Use uncontrolled `<form>` submit | Always `e.preventDefault()` + `e.stopPropagation()` + `void form.handleSubmit()` |
| Nest `<form>` elements | One `<form>` per form instance — use `withForm` sections instead |

---

## 🗂️ ERP-Specific Patterns

### Wizard / Multi-step forms
Keep a single `useAppForm` instance at the top, step through sections by index.
Don't create a new form per step — you lose cross-step validation.

```tsx
const [step, setStep] = useState(0)
const form = useAppForm({ ...bookingFormOpts, onSubmit: ... })

// Validate only current step fields before advancing
const handleNext = async () => {
  await form.validateField('client.name', 'blur')
  await form.validateField('client.email', 'blur')
  // check form.state.fieldMeta for errors before advancing
  const hasErrors = Object.values(form.state.fieldMeta).some(
    (meta) => meta.errors.length > 0
  )
  if (!hasErrors) setStep((s) => s + 1)
}
```

### Draft/autosave
Subscribe to form values, debounce, post to server:

```tsx
const values = form.useStore((s) => s.values)

useEffect(() => {
  const timer = setTimeout(() => {
    if (form.state.isDirty) {
      saveDraft(values)
    }
  }, 1500)
  return () => clearTimeout(timer)
}, [values])
```

### Reset after save
```ts
onSubmit: async ({ value }) => {
  await save(value)
  form.reset() // resets to defaultValues
}
```

### Pre-fill from URL/query params (e.g., clone booking)
```ts
const form = useAppForm({
  ...bookingFormOpts,
  defaultValues: {
    ...bookingFormOpts.defaultValues,
    client: clonedBooking?.client ?? bookingFormOpts.defaultValues.client,
  },
})
```

---

## 📦 Packages

```bash
# Core
pnpm add @tanstack/react-form

# Zod (Standard Schema — no adapter needed in v1)
pnpm add zod

# DevTools (optional but useful)
pnpm add @tanstack/react-form-devtools
```

> In v1, Zod works via Standard Schema. You do NOT need `@tanstack/zod-form-adapter` anymore.
> Pass the Zod schema directly as the validator value.

---

## 🐛 Known Issues (as of March 2026)

1. **Form-level `onChange` + Zod schema → all fields re-render** (issue #1625). Workaround: use field-level validators or form-level `onSubmit`/`onBlur`.
2. **`withForm` TypeScript mismatch** when form generics don't fully align. Workaround: `form as never` cast at call site.
3. **`withFieldGroup` doesn't work across unrelated form shapes** — the field keys must exist in the parent form. This is by design.
4. **Fast Refresh with `withForm`**: Make sure the render function is a named function (not arrow), e.g., `render: function MySection({ form }) { ... }`. This is required for HMR/Fast Refresh to work (fixed in later v1 releases).

---

## 🚀 Quick Reference

```ts
// Initialize
const form = useAppForm({ ...opts, onSubmit: async ({ value }) => {} })

// Render field with registered component
<form.AppField name="fieldPath">
  {(field) => <field.ComponentName prop="value" />}
</form.AppField>

// Render form-level component
<form.SubmitButton label="Save" />

// Subscribe to state slice (no unnecessary re-renders)
<form.Subscribe selector={(s) => s.values.someField}>
  {(someField) => someField === 'x' ? <Extra /> : null}
</form.Subscribe>

// Array operations
form.pushFieldValue('items', newItem)
form.removeFieldValue('items', index)
form.swapFieldValues('items', indexA, indexB)

// Programmatic
form.setFieldValue('client.name', 'Xery')
form.getFieldValue('client.email')
form.validateField('email', 'change')
form.reset()
form.handleSubmit()
```