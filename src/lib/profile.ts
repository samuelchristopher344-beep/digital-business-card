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
};

export const DEFAULT_PROFILE: Profile = {
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
};

const STORAGE_KEY = "calling-card.profile.v1";

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

export function shareUrl(profile: Profile): string {
  const path = `${window.location.pathname}${window.location.search}`;
  return `${window.location.origin}${path}#c=${encodeProfile(profile)}`;
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
  const parts = ["MECARD:"];
  const name = last || first ? `${mecardEsc(last)},${mecardEsc(first)}` : "";
  if (name) parts.push(`N:${name};`);
  if (profile.phone) parts.push(`TEL:${mecardEsc(profile.phone)};`);
  if (profile.email) parts.push(`EMAIL:${mecardEsc(profile.email)};`);
  const site = hrefForWebsite(profile.website);
  if (site) parts.push(`URL:${mecardEsc(site)};`);
  if (profile.organization) parts.push(`ORG:${mecardEsc(profile.organization)};`);
  const note = profile.role || profile.tagline;
  if (note) parts.push(`NOTE:${mecardEsc(note)};`);
  parts.push(";");
  return parts.join("");
}

export function hrefForWebsite(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function displayHost(value: string): string {
  const href = hrefForWebsite(value);
  if (!href) return "";
  try {
    return new URL(href).host.replace(/^www\./, "");
  } catch {
    return value.trim();
  }
}

export function githubHref(value: string): string {
  const trimmed = value.trim().replace(/^@/, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://github.com/${trimmed}`;
}

export function githubLabel(value: string): string {
  const trimmed = value.trim().replace(/^@/, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const path = new URL(trimmed).pathname.replace(/^\//, "");
      return path || trimmed;
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

export function downloadFileName(profile: Profile): string {
  const slug = profile.fullName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${slug || "contact"}.vcf`;
}
