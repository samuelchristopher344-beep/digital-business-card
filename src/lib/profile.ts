import { z } from "zod";

export const THEMES = [
  { id: "brass", label: "Brass" },
  { id: "signal", label: "Signal" },
  { id: "tide", label: "Tide" },
  { id: "ink", label: "Graphite" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export type Profile = {
  fullName: string;
  role: string;
  organization: string;
  tagline: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  github: string;
  note: string;
  focus: string[];
  theme: ThemeId;
  /** Public handle used in /u/:slug links */
  username: string;
};

/** Blank profile for new users — never seed someone else's identity. */
export const EMPTY_PROFILE: Profile = {
  fullName: "",
  role: "",
  organization: "",
  tagline: "",
  email: "",
  phone: "",
  website: "",
  location: "",
  github: "",
  note: "",
  focus: [],
  theme: "brass",
  username: "",
};

/** Demo card only — used on /u/demo, not the homepage. */
export const DEMO_PROFILE: Profile = {
  fullName: "Samuel Christopher",
  role: "Engineering & Innovation",
  organization: "christoflightX-1",
  tagline: "Engineering ideas. Building the future.",
  email: "samuelchristopher344@gmail.com",
  phone: "",
  website: "https://samuelchristopher344-beep.github.io",
  location: "Remote",
  github: "samuelchristopher344-beep",
  note: "Drones, propulsion, marine craft, and future mobility — ideas into prototypes.",
  focus: ["Drones", "Propulsion", "Marine", "Electronics"],
  theme: "brass",
  username: "demo",
};

/** @deprecated Prefer EMPTY_PROFILE or DEMO_PROFILE explicitly. */
export const DEFAULT_PROFILE = DEMO_PROFILE;

const STORAGE_KEY = "calling-card.profile.v1";
const SLUG_KEY = "calling-card.slug.v1";

const themeSchema = z.enum(["brass", "signal", "tide", "ink"]);

const packedSchema = z.object({
  n: z.string().max(80).optional(),
  r: z.string().max(80).optional(),
  o: z.string().max(80).optional(),
  t: z.string().max(160).optional(),
  e: z.string().max(120).optional(),
  p: z.string().max(40).optional(),
  w: z.string().max(200).optional(),
  l: z.string().max(80).optional(),
  g: z.string().max(120).optional(),
  m: z.string().max(280).optional(),
  f: z.array(z.string().max(24)).max(6).optional(),
  h: themeSchema.optional(),
  u: z.string().max(40).optional(),
});

function unpack(data: z.infer<typeof packedSchema>): Profile {
  return {
    fullName: data.n?.trim() ?? "",
    role: data.r?.trim() ?? "",
    organization: data.o?.trim() ?? "",
    tagline: data.t?.trim() ?? "",
    email: data.e?.trim() ?? "",
    phone: data.p?.trim() ?? "",
    website: data.w?.trim() ?? "",
    location: data.l?.trim() ?? "",
    github: data.g?.trim() ?? "",
    note: data.m?.trim() ?? "",
    focus: (data.f ?? []).map((item) => item.trim()).filter(Boolean).slice(0, 6),
    theme: data.h ?? "brass",
    username: data.u?.trim().toLowerCase() ?? "",
  };
}

function pack(profile: Profile): z.infer<typeof packedSchema> {
  const packed: z.infer<typeof packedSchema> = {};
  if (profile.fullName) packed.n = profile.fullName;
  if (profile.role) packed.r = profile.role;
  if (profile.organization) packed.o = profile.organization;
  if (profile.tagline) packed.t = profile.tagline;
  if (profile.email) packed.e = profile.email;
  if (profile.phone) packed.p = profile.phone;
  if (profile.website) packed.w = profile.website;
  if (profile.location) packed.l = profile.location;
  if (profile.github) packed.g = profile.github;
  if (profile.note) packed.m = profile.note;
  if (profile.focus.length) packed.f = profile.focus;
  if (profile.theme !== "brass") packed.h = profile.theme;
  if (profile.username) packed.u = profile.username;
  return packed;
}

export function encodeProfile(profile: Profile): string {
  const json = JSON.stringify(pack(profile));
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeProfile(token: string): Profile | null {
  try {
    const padded = token.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const binary = atob(padded + pad);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json: unknown = JSON.parse(new TextDecoder().decode(bytes));
    const parsed = packedSchema.safeParse(json);
    if (!parsed.success) return null;
    return unpack(parsed.data);
  } catch {
    return null;
  }
}

export function readHashProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash.startsWith("#c=")) return null;
  return decodeProfile(hash.slice(3));
}

export function writeHash(profile: Profile) {
  const next = `#c=${encodeProfile(profile)}`;
  if (window.location.hash === next) return;
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${next}`);
}

/** Prefer /u/:username when a handle exists; fall back to current path. */
export function shareUrl(profile: Profile): string {
  if (typeof window === "undefined") return "";
  const slug = slugify(profile.username || profile.fullName);
  if (slug) {
    return `${window.location.origin}/u/${slug}#c=${encodeProfile(profile)}`;
  }
  const path = `${window.location.pathname}${window.location.search}`;
  return `${window.location.origin}${path}#c=${encodeProfile(profile)}`;
}

export function publicCardUrl(profile: Profile): string {
  return shareUrl(profile);
}

export function readStoredProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = packedSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    return unpack(parsed.data);
  } catch {
    return null;
  }
}

export function writeStoredProfile(profile: Profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pack(profile)));
  if (profile.username) {
    localStorage.setItem(SLUG_KEY, profile.username);
  }
}

export function readStoredSlug(): string | null {
  try {
    return localStorage.getItem(SLUG_KEY);
  } catch {
    return null;
  }
}

/** Turn a name or handle into a URL-safe slug. */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

function vEsc(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function toVCard(profile: Profile): string {
  const { first, last } = splitName(profile.fullName);
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${vEsc(last)};${vEsc(first)};;;`,
    `FN:${vEsc(profile.fullName)}`,
  ];
  if (profile.organization) lines.push(`ORG:${vEsc(profile.organization)}`);
  if (profile.role) lines.push(`TITLE:${vEsc(profile.role)}`);
  if (profile.email) lines.push(`EMAIL;TYPE=INTERNET:${vEsc(profile.email)}`);
  if (profile.phone) lines.push(`TEL;TYPE=CELL:${vEsc(profile.phone)}`);
  const site = hrefForWebsite(profile.website);
  if (site) lines.push(`URL:${vEsc(site)}`);
  const gh = githubHref(profile.github);
  if (gh) lines.push(`URL:${vEsc(gh)}`);
  if (profile.location) lines.push(`ADR;TYPE=WORK:;;${vEsc(profile.location)};;;;`);
  const note = [profile.tagline, profile.note, profile.focus.length ? profile.focus.join(", ") : ""]
    .filter(Boolean)
    .join("\n");
  if (note) lines.push(`NOTE:${vEsc(note)}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function mecardEsc(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

export function toMeCard(profile: Profile): string {
  const { first, last } = splitName(profile.fullName);
  const parts = [`MECARD:N:${mecardEsc(last)},${mecardEsc(first)}`];
  if (profile.phone) parts.push(`TEL:${mecardEsc(profile.phone)}`);
  if (profile.email) parts.push(`EMAIL:${mecardEsc(profile.email)}`);
  const site = hrefForWebsite(profile.website);
  if (site) parts.push(`URL:${mecardEsc(site)}`);
  if (profile.note || profile.tagline) {
    parts.push(`NOTE:${mecardEsc([profile.tagline, profile.note].filter(Boolean).join(" — "))}`);
  }
  return parts.join(";") + ";;";
}

export function downloadFileName(profile: Profile): string {
  const base = slugify(profile.fullName || profile.username || "contact") || "contact";
  return `${base}.vcf`;
}

export function hrefForWebsite(website: string): string | undefined {
  const value = website.trim();
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export function displayHost(website: string): string {
  try {
    const href = hrefForWebsite(website);
    if (!href) return website;
    return new URL(href).host.replace(/^www\./, "");
  } catch {
    return website;
  }
}

export function githubHref(github: string): string | undefined {
  const value = github.trim();
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://github.com/${value.replace(/^@/, "")}`;
}

export function githubLabel(github: string): string {
  const value = github.trim().replace(/^@/, "");
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) {
    try {
      const path = new URL(value).pathname.replace(/^\//, "");
      return path || value;
    } catch {
      return value;
    }
  }
  return value;
}
