// Zod
import * as z from "zod";

/**
 * Customer form validation schema
 *
 * Validates all required fields for customer creation/editing.
 */
export const customerFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .min(7, "Please enter a valid phone number"),
  gender: z.enum(["male", "female"]),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;

/**
 * Default values for customer form
 */
export const customerFormDefaults: CustomerFormData = {
  name: "",
  email: "",
  phone: "",
  gender: "male",
};
