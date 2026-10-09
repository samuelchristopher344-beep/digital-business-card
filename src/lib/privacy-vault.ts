/**
 * PRIVATE vault — stored only in THIS browser/device (localStorage).
 * Never uploaded. Never shown on public cards. Never visible to other users.
 */

export const CONTACT_TAGS = [
  { id: "client", label: "Client" },
  { id: "peer", label: "Peer" },
  { id: "hire", label: "Hiring / job" },
  { id: "friend", label: "Friend" },
  { id: "partner", label: "Partner" },
  { id: "vendor", label: "Vendor" },
  { id: "investor", label: "Investor" },
  { id: "other", label: "Other" },
] as const;

export type ContactTagId = (typeof CONTACT_TAGS)[number]["id"];

export type PrivateContact = {
  id: string;
  /** Card slug or stable key */
  slug: string;
  fullName: string;
  email: string;
  phone: string;
  link: string;
  tag: ContactTagId;
  /** ONLY visible to you — never shared */
  note: string;
  metAt: string;
  createdAt: number;
  updatedAt: number;
};

export type BlockedEntry = {
  key: string;
  label: string;
  reason: string;
  at: number;
};

export type ReportEntry = {
  id: string;
  targetSlug: string;
  reason: string;
  details: string;
  at: number;
};

export type LoginAlert = {
  id: string;
  at: number;
  summary: string;
  userAgent: string;
};

const CONTACTS_KEY = "cc.privacy.contacts.v1";
const BLOCKS_KEY = "cc.privacy.blocks.v1";
const REPORTS_KEY = "cc.privacy.reports.v1";
const ALERTS_KEY = "cc.privacy.login-alerts.v1";
const ALERTS_ENABLED_KEY = "cc.privacy.login-alerts.enabled.v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function listPrivateContacts(): PrivateContact[] {
  return readJson<PrivateContact[]>(CONTACTS_KEY, []).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function upsertPrivateContact(
  input: Omit<PrivateContact, "id" | "createdAt" | "updatedAt"> & { id?: string },
): PrivateContact {
  const all = listPrivateContacts();
  const now = Date.now();
  const existing = input.id
    ? all.find((c) => c.id === input.id)
    : all.find((c) => c.slug === input.slug && input.slug);
  const row: PrivateContact = {
    id: existing?.id || input.id || crypto.randomUUID(),
    slug: input.slug,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    link: input.link,
    tag: input.tag,
    note: input.note,
    metAt: input.metAt,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  const next = [row, ...all.filter((c) => c.id !== row.id)];
  writeJson(CONTACTS_KEY, next);
  return row;
}

export function deletePrivateContact(id: string) {
  writeJson(
    CONTACTS_KEY,
    listPrivateContacts().filter((c) => c.id !== id),
  );
}

export function listBlocks(): BlockedEntry[] {
  return readJson<BlockedEntry[]>(BLOCKS_KEY, []).sort((a, b) => b.at - a.at);
}

export function isBlocked(key: string): boolean {
  return listBlocks().some((b) => b.key === key);
}

export function blockKey(slug: string, label: string, reason = "") {
  if (isBlocked(slug)) return;
  const entry: BlockedEntry = {
    key: slug,
    label: label || slug,
    reason,
    at: Date.now(),
  };
  writeJson(BLOCKS_KEY, [entry, ...listBlocks()]);
}

export function unblockKey(key: string) {
  writeJson(
    BLOCKS_KEY,
    listBlocks().filter((b) => b.key !== key),
  );
}

export function listReports(): ReportEntry[] {
  return readJson<ReportEntry[]>(REPORTS_KEY, []).sort((a, b) => b.at - a.at);
}

export function submitReport(targetSlug: string, reason: string, details: string) {
  const entry: ReportEntry = {
    id: crypto.randomUUID(),
    targetSlug,
    reason,
    details: details.slice(0, 500),
    at: Date.now(),
  };
  writeJson(REPORTS_KEY, [entry, ...listReports()].slice(0, 50));
  return entry;
}

export function loginAlertsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const v = localStorage.getItem(ALERTS_ENABLED_KEY);
  return v !== "0";
}

export function setLoginAlertsEnabled(on: boolean) {
  localStorage.setItem(ALERTS_ENABLED_KEY, on ? "1" : "0");
}

export function listLoginAlerts(): LoginAlert[] {
  return readJson<LoginAlert[]>(ALERTS_KEY, []).sort((a, b) => b.at - a.at);
}

/** Record a sign-in style alert on this device (local only until server email is wired). */
export function recordLoginAlert(summary?: string) {
  if (typeof window === "undefined") return;
  if (!loginAlertsEnabled()) return;
  const ua = navigator.userAgent.slice(0, 180);
  const last = listLoginAlerts()[0];
  // Avoid spam: skip if same UA within 2 hours
  if (last && last.userAgent === ua && Date.now() - last.at < 2 * 60 * 60 * 1000) return;
  const entry: LoginAlert = {
    id: crypto.randomUUID(),
    at: Date.now(),
    summary: summary || "Sign-in activity on this device",
    userAgent: ua,
  };
  writeJson(ALERTS_KEY, [entry, ...listLoginAlerts()].slice(0, 30));
}

export const PRIVACY_COPY = {
  onlyYou:
    "Only you can see this. It stays on this device and is never shown on a public card or to other users.",
  notLinked:
    "This is not linked to anyone else’s account. Other people cannot read your tags or notes.",
  anonymousStats:
    "Counts are anonymous totals for your card. We do not show who viewed you or exact locations.",
  block:
    "Block only affects your lists on this device. The other person is not notified.",
  report:
    "Reports are for safety (spam, phishing, impersonation). False reports may be ignored.",
} as const;
