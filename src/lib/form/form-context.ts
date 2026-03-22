// TanStack Form
import { lazy } from "react";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

// Step 1: Create contexts - passed into createFormHook and field components
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

// Step 2: Lazy-load field components for code splitting
const InputField = lazy(() => import("./field-components/InputField"));
const DatePickerField = lazy(
  () => import("./field-components/DatePickerField"),
);
const SelectField = lazy(() => import("./field-components/SelectField"));
const PhoneField = lazy(() => import("./field-components/PhoneField"));
const RadioCardField = lazy(() => import("./field-components/RadioCardField"));
const CheckboxGroupField = lazy(
  () => import("./field-components/CheckboxGroupField"),
);

// Step 3: Lazy-load form components
const SubmitButton = lazy(() => import("./form-components/SubmitButton"));

// Step 4: Build app-specific form hook
export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    DatePickerField,
    InputField,
    SelectField,
    PhoneField,
    RadioCardField,
    CheckboxGroupField,
  },
  formComponents: {
    SubmitButton,
  },
});
