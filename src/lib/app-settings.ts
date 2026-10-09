/** App-wide settings — local only. No Free/Pro tiers. */

import { ADDRESS_COUNTRIES, type CountryCode, readAddressCountry, writeAddressCountry } from "./address-countries";
import { loginAlertsEnabled, setLoginAlertsEnabled } from "./privacy-vault";

export type ThemePref = "system" | "light" | "dark";
export type DefaultTag = "client" | "peer" | "hire" | "friend" | "partner" | "vendor" | "investor" | "other";

export type AppSettings = {
  theme: ThemePref;
  /** Public card field visibility */
  showEmailOnCard: boolean;
  showPhoneOnCard: boolean;
  showAddressOnCard: boolean;
  cardUnlistedUntilPublish: boolean;
  allowSearchIndexing: boolean;
  addressCountry: CountryCode;
  /** Notifications */
  loginAlerts: boolean;
  eventExpiryReminder: boolean;
  weeklyInsightsEmail: boolean;
  cardBirthdayNote: boolean;
  /** Insights */
  insightsEnabled: boolean;
  /** Sharing */
  defaultQrMode: "card" | "contact";
  autoMessageAfterScan: boolean;
  /** Contacts */
  defaultContactTag: DefaultTag;
  /** Event defaults */
  defaultEventDays: number;
  freeToChatMinutes: number;
};

const KEY = "cc.app-settings.v1";

export function defaultSettings(): AppSettings {
  return {
    theme: "system",
    showEmailOnCard: false,
    showPhoneOnCard: false,
    showAddressOnCard: false,
    cardUnlistedUntilPublish: true,
    allowSearchIndexing: false,
    addressCountry: "OTHER",
    loginAlerts: true,
    eventExpiryReminder: true,
    weeklyInsightsEmail: false,
    cardBirthdayNote: false,
    insightsEnabled: true,
    defaultQrMode: "card",
    autoMessageAfterScan: false,
    defaultContactTag: "peer",
    defaultEventDays: 3,
    freeToChatMinutes: 15,
  };
}

export function readSettings(): AppSettings {
  if (typeof window === "undefined") return defaultSettings();
  try {
    const raw = localStorage.getItem(KEY);
    const base = defaultSettings();
    if (!raw) {
      return {
        ...base,
        addressCountry: readAddressCountry(),
        loginAlerts: loginAlertsEnabled(),
      };
    }
    const parsed = { ...base, ...(JSON.parse(raw) as Partial<AppSettings>) };
    parsed.addressCountry = parsed.addressCountry || readAddressCountry();
    return parsed;
  } catch {
    return defaultSettings();
  }
}

export function writeSettings(next: AppSettings) {
  localStorage.setItem(KEY, JSON.stringify(next));
  writeAddressCountry(next.addressCountry);
  setLoginAlertsEnabled(next.loginAlerts);
  applyTheme(next.theme);
}

export function patchSettings(partial: Partial<AppSettings>): AppSettings {
  const next = { ...readSettings(), ...partial };
  writeSettings(next);
  return next;
}

export function applyTheme(theme: ThemePref) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const preferDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", preferDark);
  root.dataset.theme = theme;
}

export function initThemeFromStorage() {
  if (typeof window === "undefined") return;
  applyTheme(readSettings().theme);
}

export { ADDRESS_COUNTRIES };
