// Utils
import { Country } from "country-state-city";

// Types
import type { DocumentChecklistItem, TripType } from "./types";

// ----- Select option arrays -----

export const VISA_TYPE_OPTIONS = [
  { label: "Tourist", value: "Tourist" },
  { label: "Business", value: "Business" },
  { label: "Student", value: "Student" },
  { label: "Work", value: "Work" },
  { label: "Transit", value: "Transit" },
  { label: "Medical", value: "Medical" },
  { label: "Dependent", value: "Dependent" },
  { label: "OCI", value: "OCI" },
  { label: "E-Visa", value: "E-Visa" },
] as const;

export const PROCESSING_TYPE_OPTIONS = [
  { label: "Normal", value: "Normal" },
  { label: "Express", value: "Express" },
  { label: "Super Express", value: "Super Express" },
  { label: "On Arrival", value: "On Arrival" },
  { label: "E-Visa / ETA", value: "E-Visa / ETA" },
  { label: "Emergency", value: "Emergency" },
] as const;

export const VISA_CATEGORY_OPTIONS = [
  { label: "Single Entry", value: "Single Entry" },
  { label: "Double Entry", value: "Double Entry" },
  { label: "Multiple Entry", value: "Multiple Entry" },
] as const;

export const TRIP_TYPE_OPTIONS = [
  { label: "Leisure", value: "Leisure" },
  { label: "Corporate", value: "Corporate" },
  { label: "Family", value: "Family" },
  { label: "Education", value: "Education" },
  { label: "Medical", value: "Medical" },
] as const;

export const SUBMISSION_MODE_OPTIONS = [
  { label: "In-Person", value: "In-Person" },
  { label: "VFS", value: "VFS" },
  { label: "Online Portal", value: "Online Portal" },
  { label: "Courier", value: "Courier" },
] as const;

export const CURRENCY_OPTIONS = [
  { label: "USD — US Dollar", value: "USD" },
  { label: "EUR — Euro", value: "EUR" },
  { label: "GBP — British Pound", value: "GBP" },
  { label: "INR — Indian Rupee", value: "INR" },
  { label: "AED — UAE Dirham", value: "AED" },
  { label: "SAR — Saudi Riyal", value: "SAR" },
  { label: "PKR — Pakistani Rupee", value: "PKR" },
  { label: "BDT — Bangladeshi Taka", value: "BDT" },
  { label: "MYR — Malaysian Ringgit", value: "MYR" },
  { label: "SGD — Singapore Dollar", value: "SGD" },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { label: "Unpaid", value: "Unpaid" },
  { label: "Partial", value: "Partial" },
  { label: "Paid", value: "Paid" },
] as const;

// ----- Country list -----

export const COUNTRY_OPTIONS = Country.getAllCountries()
  .map((country) => ({
    label: country.name,
    value: country.name,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

// ----- Document checklist templates by trip type -----

function makeDoc(
  name: string,
  required: boolean,
): DocumentChecklistItem {
  return { name, required, status: "pending" };
}

const BASE_DOCUMENTS: DocumentChecklistItem[] = [
  makeDoc("Passport (valid 6 months beyond travel)", true),
  makeDoc("Passport-size photographs", true),
  makeDoc("Filled government application form", true),
  makeDoc("Bank statements (last 3–6 months)", true),
];

export const DOCUMENT_TEMPLATES: Record<TripType, DocumentChecklistItem[]> = {
  Leisure: [
    ...BASE_DOCUMENTS,
    makeDoc("Confirmed flight itinerary", true),
    makeDoc("Hotel / accommodation proof", true),
    makeDoc("Travel insurance", false),
    makeDoc("Cover letter", false),
    makeDoc("ITR / Salary slips", false),
  ],
  Corporate: [
    ...BASE_DOCUMENTS,
    makeDoc("Confirmed flight itinerary", true),
    makeDoc("Hotel / accommodation proof", true),
    makeDoc("Travel insurance", false),
    makeDoc("Employer NOC / letter", true),
    makeDoc("Invitation letter (host company)", true),
    makeDoc("ITR / Salary slips", true),
  ],
  Family: [
    ...BASE_DOCUMENTS,
    makeDoc("Confirmed flight itinerary", true),
    makeDoc("Travel insurance", false),
    makeDoc("Invitation letter (family member)", true),
    makeDoc("Relationship / sponsorship proof", true),
    makeDoc("ITR / Salary slips", false),
  ],
  Education: [
    ...BASE_DOCUMENTS,
    makeDoc("Admission / enrollment letter", true),
    makeDoc("Academic transcripts", true),
    makeDoc("Language test scores", true),
    makeDoc("Travel insurance", false),
    makeDoc("ITR / Salary slips (sponsor)", false),
  ],
  Medical: [
    ...BASE_DOCUMENTS,
    makeDoc("Confirmed flight itinerary", true),
    makeDoc("Hospital / treatment appointment letter", true),
    makeDoc("Medical records / referral", true),
    makeDoc("Travel insurance", true),
    makeDoc("Hotel / accommodation proof", false),
    makeDoc("ITR / Salary slips", false),
  ],
};

// ----- Valid status transitions -----

export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  Draft: ["Documents Pending", "Cancelled"],
  "Documents Pending": ["Ready to Submit", "Cancelled"],
  "Ready to Submit": ["Submitted", "Cancelled"],
  Submitted: ["Under Processing", "Cancelled"],
  "Under Processing": ["Approved", "Rejected", "Cancelled"],
  Approved: ["Visa Issued", "Cancelled"],
  "Visa Issued": [],
  Rejected: ["Draft"],
  Cancelled: [],
};
