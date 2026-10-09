/** User-selected country for address field hints — no GPS required. */

export const ADDRESS_COUNTRIES = [
  { code: "NG", label: "Nigeria", hint: "Street, city, state" },
  { code: "US", label: "United States", hint: "Street, City, ST ZIP" },
  { code: "GB", label: "United Kingdom", hint: "Street, city, postcode" },
  { code: "CA", label: "Canada", hint: "Street, City, Province Postal" },
  { code: "DE", label: "Germany", hint: "Street, PLZ City" },
  { code: "FR", label: "France", hint: "Street, code postal Ville" },
  { code: "IN", label: "India", hint: "Street, city, state PIN" },
  { code: "BR", label: "Brazil", hint: "Street, city, state CEP" },
  { code: "ZA", label: "South Africa", hint: "Street, city, postal code" },
  { code: "KE", label: "Kenya", hint: "Street, city" },
  { code: "GH", label: "Ghana", hint: "Street, city" },
  { code: "OTHER", label: "Other / custom", hint: "As you prefer" },
] as const;

export type CountryCode = (typeof ADDRESS_COUNTRIES)[number]["code"];

const KEY = "cc.address-country.v1";

export function readAddressCountry(): CountryCode {
  if (typeof window === "undefined") return "OTHER";
  const v = localStorage.getItem(KEY);
  if (ADDRESS_COUNTRIES.some((c) => c.code === v)) return v as CountryCode;
  return "OTHER";
}

export function writeAddressCountry(code: CountryCode) {
  localStorage.setItem(KEY, code);
}

export function countryHint(code: CountryCode): string {
  return ADDRESS_COUNTRIES.find((c) => c.code === code)?.hint || "As you prefer";
}
