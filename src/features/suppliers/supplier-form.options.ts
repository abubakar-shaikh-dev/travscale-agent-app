// Zod
import { z } from "zod";

// Types
import type { ServiceType } from "./types";

export const supplierFormSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  contactPersonName: z.string().min(1, "Contact person name is required"),
  contactPersonPhone: z.string().min(7, "Valid phone number is required"),
  whatsappNumber: z.string().min(7, "Valid WhatsApp number is required"),
  contactPersonEmail: z.string().email("Valid email address is required"),
  website: z.string().url("Valid URL required").optional().or(z.literal("")),
  address: z.string().min(10, "Address must be at least 10 characters"),
  serviceTypes: z
    .array(z.enum(["visa", "passport", "hotels", "bus", "flight"]))
    .min(1, "Select at least one service type"),
});

export type SupplierFormData = z.infer<typeof supplierFormSchema>;

/**
 * Default values for supplier form
 */
export const supplierFormDefaults: SupplierFormData = {
  name: "",
  contactPersonName: "",
  contactPersonPhone: "",
  whatsappNumber: "",
  contactPersonEmail: "",
  website: "",
  address: "",
  serviceTypes: [] as ServiceType[],
};
