// Geo
import { City, Country, State } from "country-state-city";

// Types
import type { GeoOption } from "./geo";

/**
 * Raw dataset access over `country-state-city`.
 *
 * This module is the ONLY place that imports the library (an 8.5 MB
 * dataset). It is loaded through a dynamic `import()` from `lib/geo.ts` so
 * the bytes stay out of every route bundle until a geo picker actually
 * needs them.
 */

/** Country name by ISO 3166-1 alpha-2 code. */
export function findCountry(isoCode: string): { name: string; currency: string | null } | undefined {
  const country = Country.getCountryByCode(isoCode);
  if (!country) return undefined;
  return { name: country.name, currency: country.currency || null };
}

export function buildCountryOptions(): GeoOption[] {
  return Country.getAllCountries().map((c) => ({
    value: c.isoCode,
    label: c.name,
    hint: c.isoCode,
  }));
}

export function buildStateOptions(countryCode: string): GeoOption[] {
  return State.getStatesOfCountry(countryCode).map((s) => ({
    value: s.isoCode,
    label: s.name,
    hint: s.isoCode,
  }));
}

export function buildCityOptionsOfState(
  countryCode: string,
  stateCode: string
): GeoOption[] {
  return City.getCitiesOfState(countryCode, stateCode).map((c) => ({
    value: c.name,
    label: c.name,
  }));
}

export function buildCityOptionsOfCountry(countryCode: string): GeoOption[] {
  return (City.getCitiesOfCountry(countryCode) ?? []).map((c) => ({
    value: c.name,
    label: c.name,
  }));
}

export function buildCurrencyOptions(): GeoOption[] {
  const codes = new Set<string>();
  for (const country of Country.getAllCountries()) {
    if (country.currency) codes.add(country.currency);
  }
  return [...codes]
    .sort((a, b) => a.localeCompare(b))
    .map((code) => ({ value: code, label: code }));
}
