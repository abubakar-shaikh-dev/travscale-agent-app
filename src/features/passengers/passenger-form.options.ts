// Zod
import * as z from "zod";

export const passengerFormSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters"),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    nationality: z
      .string()
      .min(1, "Nationality is required")
      .min(2, "Nationality must be at least 2 characters"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .min(7, "Please enter a valid phone number"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email"),
    passportNumber: z
      .string()
      .min(1, "Passport number is required")
      .min(6, "Passport number must be at least 6 characters"),
    passportExpiry: z.string().min(1, "Passport expiry date is required"),
    notes: z.string().optional(),
  })
  .refine(
    ({ dateOfBirth, passportExpiry }) => {
      if (!dateOfBirth || !passportExpiry) return true;
      return new Date(passportExpiry) > new Date(dateOfBirth);
    },
    {
      message: "Passport expiry must be after date of birth",
      path: ["passportExpiry"],
    },
  );

export type PassengerFormData = z.infer<typeof passengerFormSchema>;

export const passengerFormDefaults: PassengerFormData = {
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  nationality: "",
  phone: "",
  email: "",
  passportNumber: "",
  passportExpiry: "",
  notes: "",
};
