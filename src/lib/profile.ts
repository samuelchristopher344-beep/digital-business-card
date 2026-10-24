import { z } from "zod";
import { normalizeShowcase, type ShowcaseItem } from "@/lib/showcase";

export const THEMES = [
  { id: "brass", label: "Brass" },
  { id: "signal", label: "Signal" },
  { id: "tide", label: "Tide" },
  { id: "ink", label: "Graphite" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const CARD_TYPES = [
  { id: "personal", label: "Personal", blurb: "For individual contacts and networking" },
  { id: "business", label: "Business", blurb: "Professional or freelancer card" },
  { id: "company", label: "Company", blurb: "Company or brand card" },
  { id: "org", label: "Organization", blurb: "Team, department, or org card" },
  { id: "event", label: "Event", blurb: "Temporary card for an event" },
  { id: "creator", label: "Creator", blurb: "Portfolio or creator card" },
] as const;

export type CardTypeId = (typeof CARD_TYPES)[number]["id"];

export type Profile = {
  fullName: string;
  role: string;
  organization: string;
  tagline: string;
  email: string;
  phone: string;
  phoneCountry: string;
  website: string;
  location: string;
  github: string;
  whatsapp: string;
  telegram: string;
  linkedin: string;
  instagram: string;
  x: string;
  note: string;
  focus: string[];
  showcase: ShowcaseItem[];
  scanMessage: string;
  theme: ThemeId;
  cardType: CardTypeId;
  username: string;
};

export const EMPTY_PROFILE: Profile = {
  fullName: "",
  role: "",
  organization: "",
  tagline: "",
  email: "",
  phone: "",
  phoneCountry: "+1",
  website: "",
  location: "",
  github: "",
  whatsapp: "",
  telegram: "",
  linkedin: "",
  instagram: "",
  x: "",
  note: "",
  focus: [],
  showcase: [],
  scanMessage: "",
  theme: "brass",
  cardType: "personal",
  username: "",
};

export const DEMO_PROFILE: Profile = {
  fullName: "Samuel Christopher",
  role: "Engineering & Innovation",
  organization: "christoflightX-1",
  tagline: "Engineering ideas. Building the future.",
  email: "samuelchristopher344@gmail.com",
  phone: "+2348058946343",
  phoneCountry: "+234",
  website: "https://samuelchristopher344-beep.github.io",
  location: "Remote",
  github: "",
  whatsapp: "+2348058946343",
  telegram: "",
  linkedin: "",
  instagram: "",
  x: "",
  note: "Drones, propulsion, marine craft, and future mobility — ideas into prototypes.",
  focus: ["Drones", "Propulsion", "Marine"],
  showcase: [
    {
      id: "demo-1",
      text: "Drone Engineering & Prototyping",
      style: "workspace",
      photoUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=400&h=500&q=70",
    },
    {
      id: "demo-2",
      text: "Marine Craft Concepts",
      style: "product",
      photoUrl: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=400&h=500&q=70",
    },
    {
      id: "demo-3",
      text: "Precision Work & Fabrication",
      style: "workspace",
      photoUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&h=500&q=70",
    },
  ],
  scanMessage: "WhatsApp me to talk projects",
  theme: "brass",
  cardType: "business",
  username: "demo",
};

export const DEFAULT_PROFILE = DEMO_PROFILE;

const STORAGE_KEY = "calling-card.profile.v1";
const SLUG_KEY = "calling-card.slug.v1";

const themeSchema = z.enum(["brass", "signal", "tide", "ink"]);
const cardTypeSchema = z.enum(["personal", "business", "company", "org", "event", "creator"]);

const showcaseItemSchema = z.object({
  id: z.string().max(48),
  text: z.string().max(64),
  style: z
    .enum(["auto", "outfit", "product", "food", "event", "workspace", "portrait"])
    .optional(),
  photoUrl: z.string().max(600_000).optional(),
});

const packedSchema = z.object({
  n: z.string().max(80).optional(),
  r: z.string().max(80).optional(),
  o: z.string().max(80).optional(),
  t: z.string().max(160).optional(),
  e: z.string().max(120).optional(),
  p: z.string().max(40).optional(),
  pc: z.string().max(8).optional(),
  w: z.string().max(200).optional(),
  l: z.string().max(80).optional(),
  g: z.string().max(120).optional(),
  wa: z.string().max(40).optional(),
  tg: z.string().max(80).optional(),
  li: z.string().max(200).optional(),
  ig: z.string().max(80).optional(),
  x: z.string().max(80).optional(),
  m: z.string().max(280).optional(),
  f: z.array(z.string().max(24)).max(6).optional(),
  sc: z.array(showcaseItemSchema).max(6).optional(),
  sm: z.string().max(160).optional(),
  h: themeSchema.optional(),
  ct: cardTypeSchema.optional(),
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
    phoneCountry: data.pc?.trim() || "+1",
    website: data.w?.trim() ?? "",
    location: data.l?.trim() ?? "",
    github: data.g?.trim() ?? "",
    whatsapp: data.wa?.trim() ?? "",
    telegram: data.tg?.trim() ?? "",
    linkedin: data.li?.trim() ?? "",
    instagram: data.ig?.trim() ?? "",
    x: data.x?.trim() ?? "",
    note: data.m?.trim() ?? "",
    focus: (data.f ?? []).map((item) => item.trim()).filter(Boolean).slice(0, 6),
    showcase: normalizeShowcase(data.sc),
    scanMessage: data.sm?.trim() ?? "",
    theme: data.h ?? "brass",
    cardType: data.ct ?? "personal",
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
  if (profile.phoneCountry && profile.phoneCountry !== "+1") packed.pc = profile.phoneCountry;
  if (profile.website) packed.w = profile.website;
  if (profile.location) packed.l = profile.location;
  if (profile.github) packed.g = profile.github;
  if (profile.whatsapp) packed.wa = profile.whatsapp;
  if (profile.telegram) packed.tg = profile.telegram;
  if (profile.linkedin) packed.li = profile.linkedin;
  if (profile.instagram) packed.ig = profile.instagram;
  if (profile.x) packed.x = profile.x;
  if (profile.note) packed.m = profile.note;
  if (profile.focus.length) packed.f = profile.focus;
  if (profile.showcase?.length) {
    packed.sc = normalizeShowcase(profile.showcase).map((item) => ({
      id: item.id,
      text: item.text,
      ...(item.style && item.style !== "auto" ? { style: item.style } : {}),
      ...(item.photoUrl ? { photoUrl: item.photoUrl } : {}),
    }));
  }
  if (profile.scanMessage?.trim()) packed.sm = profile.scanMessage.trim().slice(0, 160);
  if (profile.theme !== "brass") packed.h = profile.theme;
  if (profile.cardType !== "personal") packed.ct = profile.cardType;
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
  const fullPhone = getFullPhone(profile);
  if (fullPhone) lines.push(`TEL;TYPE=CELL:${vEsc(fullPhone)}`);
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
  const fullPhone = getFullPhone(profile);
  if (fullPhone) parts.push(`TEL:${mecardEsc(fullPhone)}`);
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

export function whatsappHref(value: string): string | undefined {
  const digits = value.replace(/[^\d]/g, "");
  if (digits.length < 8) return undefined;
  return `https://wa.me/${digits}`;
}

export function telegramHref(value: string): string | undefined {
  const trimmed = value.trim().replace(/^@/, "");
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return hrefForWebsite(trimmed);
  return `https://t.me/${trimmed}`;
}

export function linkedinHref(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return hrefForWebsite(trimmed);
  return `https://www.linkedin.com/in/${trimmed.replace(/^\/+/, "")}`;
}

export function instagramHref(value: string): string | undefined {
  const trimmed = value.trim().replace(/^@/, "");
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return hrefForWebsite(trimmed);
  return `https://instagram.com/${trimmed}`;
}

export function xHref(value: string): string | undefined {
  const trimmed = value.trim().replace(/^@/, "");
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return hrefForWebsite(trimmed);
  return `https://x.com/${trimmed}`;
}

export function getFullPhone(profile: Profile): string {
  const raw = profile.phone.trim();
  if (raw.startsWith("+")) return raw.replace(/[^\d+]/g, "");
  const local = raw.replace(/[^\d]/g, "");
  if (!local) return "";
  const country = (profile.phoneCountry || "+1").replace(/[^\d+]/g, "");
  return `${country}${local}`;
}

export function formatPhoneDisplay(profile: Profile): string {
  const full = getFullPhone(profile);
  if (!full) return "";
  return full.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d+)/, "$1 $2 $3 $4").trim();
}

export type { ShowcaseItem };
