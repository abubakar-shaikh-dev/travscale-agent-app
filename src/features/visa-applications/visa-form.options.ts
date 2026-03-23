// Zod
import * as z from "zod";

// Types
import type { DocumentChecklistItem } from "./types";

export const visaFormSchema = z
  .object({
    // Passenger (pre-selected)
    passengerId: z.string().min(1, "Please select a passenger"),

    // Destination & Visa Type
    destinationCountry: z.string().min(1, "Destination country is required"),
    visaType: z.string().min(1, "Visa type is required"),
    visaCategory: z.string().min(1, "Visa category is required"),
    processingType: z.string().min(1, "Processing type is required"),
    embassyConsulate: z.string().optional(),

    // Travel Intent
    intendedTravelDate: z.string().min(1, "Intended travel date is required"),
    intendedReturnDate: z.string().min(1, "Intended return date is required"),
    durationOfStay: z.number().min(1, "Duration must be at least 1 day"),
    purposeOfVisit: z.string().optional(),
    tripType: z.string().min(1, "Trip type is required"),

    // Application Logistics
    applicationDate: z.string().min(1, "Application date is required"),
    expectedDecisionDate: z.string().optional(),
    submissionMode: z.string().min(1, "Submission mode is required"),
    vfsCenter: z.string().optional(),

    // Fees
    visaFeeAmount: z.number().min(0, "Visa fee must be 0 or more"),
    visaFeeCurrency: z.string().min(1, "Currency is required"),
    serviceFeeAmount: z.number().min(0, "Service fee must be 0 or more"),
    totalAmount: z.number(),
    paymentStatus: z.string().min(1, "Payment status is required"),
    paymentReference: z.string().optional(),
  })
  .refine(
    ({ intendedTravelDate, intendedReturnDate }) => {
      if (!intendedTravelDate || !intendedReturnDate) return true;
      return new Date(intendedReturnDate) > new Date(intendedTravelDate);
    },
    {
      message: "Return date must be after travel date",
      path: ["intendedReturnDate"],
    },
  );

export type VisaFormData = z.infer<typeof visaFormSchema>;

const today = new Date().toISOString().split("T")[0];

export const visaFormDefaults: VisaFormData & {
  documents: DocumentChecklistItem[];
} = {
  passengerId: "",
  destinationCountry: "",
  visaType: "",
  visaCategory: "",
  processingType: "",
  embassyConsulate: "",
  intendedTravelDate: "",
  intendedReturnDate: "",
  durationOfStay: 0,
  purposeOfVisit: "",
  tripType: "",
  applicationDate: today,
  expectedDecisionDate: "",
  submissionMode: "",
  vfsCenter: "",
  visaFeeAmount: 0,
  visaFeeCurrency: "USD",
  serviceFeeAmount: 0,
  totalAmount: 0,
  paymentStatus: "Unpaid",
  paymentReference: "",
  documents: [],
};
