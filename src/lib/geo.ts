/**
 * Country / state / city / currency dataset access.
 *
 * The bundled dataset is large (8.5 MB), so `lib/geo-dataset.ts` is the only
 * module allowed to import `country-state-city` and it is loaded here through
 * a dynamic import: the bytes stay out of every route bundle until a geo
 * picker actually asks for them.
 *
 * Every accessor is async and memoized per key, so repeated opens of the
 * same picker (and re-renders) never re-filter or re-import anything.
 */

// Types
export interface GeoOption {
  /** Stable value sent to the API (ISO code or name). */
  value: string;
  /** Human label shown in the UI. */
  label: string;
  /** Optional secondary text (e.g. the ISO code). */
  hint?: string;
  /**
   * Optional muted line under the label (e.g. a region or full name).
   * Datasets that do not set it render single-line rows.
   */
  secondary?: string;
}

export interface CountryMeta {
  name: string;
  currency: string | null;
}

// Dataset
import type * as Dataset from "./geo-dataset";

type DatasetModule = typeof Dataset;

let datasetPromise: Promise<DatasetModule> | null = null;

function loadDataset(): Promise<DatasetModule> {
  datasetPromise ??= import("./geo-dataset");
  return datasetPromise;
}

// Memo caches (keyed datasets after the first load).
const stateCache = new Map<string, GeoOption[]>();
const cityOfStateCache = new Map<string, GeoOption[]>();
const cityOfCountryCache = new Map<string, GeoOption[]>();

let countryOptions: GeoOption[] | null = null;
let currencyOptionList: GeoOption[] | null = null;
const countryMetaCache = new Map<string, CountryMeta | undefined>();

// --- Countries ---------------------------------------------------------------

export async function getCountryOptions(): Promise<GeoOption[]> {
  countryOptions ??= (await loadDataset()).buildCountryOptions();
  return countryOptions;
}

export async function getCountryMeta(isoCode: string): Promise<CountryMeta | undefined> {
  if (!isoCode) return undefined;
  if (!countryMetaCache.has(isoCode)) {
    const meta = (await loadDataset()).findCountry(isoCode);
    countryMetaCache.set(isoCode, meta);
  }
  return countryMetaCache.get(isoCode);
}

/** Country name by ISO code (or undefined when unknown). */
export async function getCountryName(isoCode: string): Promise<string | undefined> {
  return (await getCountryMeta(isoCode))?.name;
}

/** ISO currency for a country, when the dataset knows one. */
export async function getCountryCurrency(isoCode: string): Promise<string | null> {
  return (await getCountryMeta(isoCode))?.currency ?? null;
}

// --- States ------------------------------------------------------------------

export async function getStateOptions(countryCode: string): Promise<GeoOption[]> {
  if (!countryCode) return [];
  const cached = stateCache.get(countryCode);
  if (cached) return cached;
  const options = (await loadDataset()).buildStateOptions(countryCode);
  stateCache.set(countryCode, options);
  return options;
}

/** State name by ISO code within a country (or undefined when unknown). */
export async function getStateName(
  countryCode: string,
  stateCode: string
): Promise<string | undefined> {
  const states = await getStateOptions(countryCode);
  return states.find((s) => s.value === stateCode)?.label;
}

// --- Cities ------------------------------------------------------------------

/**
 * Cities of a state. Some datasets group whole countries into one "state"
 * (GB -> England has ~2.9k cities), which is exactly why the picker
 * virtualizes its list.
 */
export async function getCityOptionsOfState(
  countryCode: string,
  stateCode: string
): Promise<GeoOption[]> {
  if (!countryCode || !stateCode) return [];
  const key = `${countryCode}|${stateCode}`;
  const cached = cityOfStateCache.get(key);
  if (cached) return cached;
  const options = (await loadDataset()).buildCityOptionsOfState(countryCode, stateCode);
  cityOfStateCache.set(key, options);
  return options;
}

/**
 * Cities of a country directly, for territories without state data (SG and
 * similar) where the state picker is disabled.
 */
export async function getCityOptionsOfCountry(countryCode: string): Promise<GeoOption[]> {
  if (!countryCode) return [];
  const cached = cityOfCountryCache.get(countryCode);
  if (cached) return cached;
  const options = (await loadDataset()).buildCityOptionsOfCountry(countryCode);
  cityOfCountryCache.set(countryCode, options);
  return options;
}

// --- Currencies --------------------------------------------------------------

/** Unique currency options derived from the country dataset, sorted by code. */
export async function getCurrencyOptions(): Promise<GeoOption[]> {
  currencyOptionList ??= (await loadDataset()).buildCurrencyOptions();
  return currencyOptionList;
}
