// ----- Enums / Constants -----

export const VISA_STATUSES = {
  DRAFT: "Draft",
  DOCUMENTS_PENDING: "Documents Pending",
  READY_TO_SUBMIT: "Ready to Submit",
  SUBMITTED: "Submitted",
  UNDER_PROCESSING: "Under Processing",
  APPROVED: "Approved",
  VISA_ISSUED: "Visa Issued",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
} as const;

export type VisaStatus = (typeof VISA_STATUSES)[keyof typeof VISA_STATUSES];

export const VISA_TYPES = {
  TOURIST: "Tourist",
  BUSINESS: "Business",
  STUDENT: "Student",
  WORK: "Work",
  TRANSIT: "Transit",
  MEDICAL: "Medical",
  DEPENDENT: "Dependent",
  OCI: "OCI",
  E_VISA: "E-Visa",
} as const;

export type VisaType = (typeof VISA_TYPES)[keyof typeof VISA_TYPES];

export const PROCESSING_TYPES = {
  NORMAL: "Normal",
  EXPRESS: "Express",
  SUPER_EXPRESS: "Super Express",
  ON_ARRIVAL: "On Arrival",
  E_VISA_ETA: "E-Visa / ETA",
  EMERGENCY: "Emergency",
} as const;

export type ProcessingType =
  (typeof PROCESSING_TYPES)[keyof typeof PROCESSING_TYPES];

export const VISA_CATEGORIES = {
  SINGLE: "Single Entry",
  DOUBLE: "Double Entry",
  MULTIPLE: "Multiple Entry",
} as const;

export type VisaCategory =
  (typeof VISA_CATEGORIES)[keyof typeof VISA_CATEGORIES];

export const TRIP_TYPES = {
  LEISURE: "Leisure",
  CORPORATE: "Corporate",
  FAMILY: "Family",
  EDUCATION: "Education",
  MEDICAL: "Medical",
} as const;

export type TripType = (typeof TRIP_TYPES)[keyof typeof TRIP_TYPES];

export const SUBMISSION_MODES = {
  IN_PERSON: "In-Person",
  VFS: "VFS",
  ONLINE: "Online Portal",
  COURIER: "Courier",
} as const;

export type SubmissionMode =
  (typeof SUBMISSION_MODES)[keyof typeof SUBMISSION_MODES];

export const PAYMENT_STATUSES = {
  UNPAID: "Unpaid",
  PARTIAL: "Partial",
  PAID: "Paid",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

// ----- Document Checklist -----

export type DocumentStatus = "pending" | "uploaded" | "verified";

export interface DocumentChecklistItem {
  name: string;
  required: boolean;
  status: DocumentStatus;
}

// ----- Status History -----

export interface VisaStatusHistoryEntry {
  status: VisaStatus;
  changedBy: string;
  changedAt: string;
  note?: string;
}

// ----- Main Entity -----

export interface VisaApplication {
  id: string;

  // Passenger (denormalized for display)
  passengerId: string;
  passengerName: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;

  // Destination & Visa Type
  destinationCountry: string;
  visaType: VisaType;
  visaCategory: VisaCategory;
  processingType: ProcessingType;
  embassyConsulate?: string;

  // Travel Intent
  intendedTravelDate: string;
  intendedReturnDate: string;
  durationOfStay: number;
  purposeOfVisit?: string;
  tripType: TripType;

  // Application Logistics
  applicationDate: string;
  expectedDecisionDate?: string;
  submissionMode: SubmissionMode;
  vfsCenter?: string;
  referenceNumber?: string;

  // Document Checklist
  documents: DocumentChecklistItem[];

  // Fees
  visaFeeAmount: number;
  visaFeeCurrency: string;
  serviceFeeAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentReference?: string;

  // Status & Outcome
  status: VisaStatus;
  visaNumber?: string;
  visaValidFrom?: string;
  visaValidTo?: string;
  numEntriesGranted?: number;
  rejectionReason?: string;
  cancellationReason?: string;

  // History
  statusHistory: VisaStatusHistoryEntry[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ----- Payloads -----

export interface CreateVisaApplicationPayload {
  passengerId: string;
  destinationCountry: string;
  visaType: VisaType;
  visaCategory: VisaCategory;
  processingType: ProcessingType;
  embassyConsulate?: string;
  intendedTravelDate: string;
  intendedReturnDate: string;
  durationOfStay: number;
  purposeOfVisit?: string;
  tripType: TripType;
  applicationDate: string;
  expectedDecisionDate?: string;
  submissionMode: SubmissionMode;
  vfsCenter?: string;
  documents: DocumentChecklistItem[];
  visaFeeAmount: number;
  visaFeeCurrency: string;
  serviceFeeAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
}

export interface UpdateVisaStatusPayload {
  status: VisaStatus;
  note?: string;
  visaNumber?: string;
  visaValidFrom?: string;
  visaValidTo?: string;
  numEntriesGranted?: number;
  rejectionReason?: string;
  cancellationReason?: string;
}

// ----- API Responses -----

export interface VisaApplicationResponse {
  data: VisaApplication;
}

export interface VisaApplicationsResponse {
  data: VisaApplication[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
