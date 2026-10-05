// Phone
import { isValidPhoneNumber } from "libphonenumber-js";

/**
 * Phone validation helpers.
 *
 * The backend validates phone numbers with libphonenumber-js (see
 * docs/api/agency-api.md §5.1) and expects the country code to be included.
 * `react-phone-input-2` (used by PhoneField) reports values with the dial
 * code but without the leading `+`, e.g. `919876543210`.
 */

/** Ensure a PhoneField-style value carries the leading `+`. */
export function normalizePhoneToE164(value: string): string {
  const trimmed = value.trim();
  return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
}

/** True when the value parses as a valid, dialable number for its region. */
export function isValidPhone(value: string): boolean {
  if (!value) return false;
  try {
    return isValidPhoneNumber(normalizePhoneToE164(value));
  } catch {
    return false;
  }
}

/** Shared error copy for forms validating a PhoneField value. */
export const PHONE_INVALID_MESSAGE =
  "Enter a valid phone number with country code";
