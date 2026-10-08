import { z } from "zod";

export const TEMPLATES = [
  { id: "professional", name: "Professional", blurb: "Dark ink, serif name, quiet brass." },
  { id: "minimal", name: "Minimal", blurb: "White field, hairline border, no decoration." },
  { id: "luxury", name: "Luxury", blurb: "Centered gold frame on black." },
  { id: "technology", name: "Technology", blurb: "Slate ground and a signal bar." },
  { id: "creative", name: "Creative", blurb: "Warm paper and an oversized name." },
  { id: "corporate", name: "Corporate", blurb: "Navy band over a structured body." },
  { id: "elegant", name: "Elegant", blurb: "Ivory, centered, thin rules." },
  { id: "modern-dark", name: "Modern dark", blurb: "Charcoal card with pill actions." },
  { id: "portfolio", name: "Personal portfolio", blurb: "Banner first, then the work." },
  { id: "freelancer", name: "Freelancer", blurb: "Services up front, booking in reach." },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]["id"];

export const ACCENTS = [
  { id: "brass", label: "Brass" },
  { id: "coral", label: "Coral" },
  { id: "tide", label: "Tide" },
  { id: "navy", label: "Navy" },
  { id: "ink", label: "Ink" },
] as const;

export type AccentId = (typeof ACCENTS)[number]["id"];

export const FONTS = [
  { id: "classic", label: "Classic" },
  { id: "clean", label: "Clean" },
] as const;

export type FontId = (typeof FONTS)[number]["id"];

export type ActionLink = { id: string; label: string; url: string };

export type CardContent = {
  fullName: string;
  title: string;
  company: string;
  headline: string;
  bio: string;
  phone: string;
  email: string;
  website: string;
  whatsapp: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  x: string;
  youtube: string;
  tiktok: string;
  github: string;
  address: string;
  mapUrl: string;
  hours: string;
  services: string[];
  portfolioUrl: string;
  bookingUrl: string;
  actions: ActionLink[];
  photo: string;
  logo: string;
};

export const FIELD_KEYS = [
  "fullName",
  "title",
  "company",
  "headline",
  "bio",
  "photo",
  "logo",
  "phone",
  "email",
  "website",
  "whatsapp",
  "linkedin",
  "instagram",
  "facebook",
  "x",
  "youtube",
  "tiktok",
  "github",
  "address",
  "mapUrl",
  "hours",
  "services",
  "portfolioUrl",
  "bookingUrl",
  "actions",
] as const;

export type FieldKey = (typeof FIELD_KEYS)[number];

export type Card = {
  id: string;
  slug: string;
  published: boolean;
  template: TemplateId;
  accent: AccentId;
  font: FontId;
  hidden: FieldKey[];
  content: CardContent;
};

const templateSchema = z.enum([
  "professional",
  "minimal",
  "luxury",
  "technology",
  "creative",
  "corporate",
  "elegant",
  "modern-dark",
  "portfolio",
  "freelancer",
]);
const accentSchema = z.enum(["brass", "coral", "tide", "navy", "ink"]);
const fontSchema = z.enum(["classic", "clean"]);
const fieldSchema = z.enum(FIELD_KEYS);

export function emptyContent(): CardContent {
  return {
    fullName: "",
    title: "",
    company: "",
    headline: "",
    bio: "",
    phone: "",
    email: "",
    website: "",
    whatsapp: "",
    linkedin: "",
    instagram: "",
    facebook: "",
    x: "",
    youtube: "",
    tiktok: "",
    github: "",
    address: "",
    mapUrl: "",
    hours: "",
    services: [],
    portfolioUrl: "",
    bookingUrl: "",
    actions: [],
    photo: "",
    logo: "",
  };
}

export function createId(): string {
  return crypto.randomUUID();
}

export function sampleCard(): Card {
  return {
    id: "sample-samuel",
    slug: "samuel-christopher",
    published: true,
    template: "professional",
    accent: "brass",
    font: "classic",
    hidden: [],
    content: {
      ...emptyContent(),
      fullName: "Samuel Christopher",
      title: "Engineering & Innovation",
      company: "christoflightX-1",
      headline: "Engineering ideas. Building the future.",
      bio: "Drones, propulsion, marine craft, and future mobility — ideas into prototypes.",
      email: "samuelchristopher344@gmail.com",
      website: "https://samuelchristopher344-beep.github.io",
      github: "samuelchristopher344-beep",
      address: "Remote",
      services: ["Drones", "Propulsion", "Marine", "Electronics"],
    },
  };
}

export function blankCard(id: string, slug: string): Card {
  return {
    id,
    slug,
    published: false,
    template: "professional",
    accent: "brass",
    font: "classic",
    hidden: [],
    content: emptyContent(),
  };
}

export function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return slug || "card";
}

export function uniqueSlug(cards: Card[], base: string, ignoreId?: string): string {
  const root = slugify(base);
  const taken = new Set(cards.filter((card) => card.id !== ignoreId).map((card) => card.slug));
  if (!taken.has(root)) return root;
  for (let n = 2; n < 100; n += 1) {
    const next = `${root.slice(0, 36)}-${n}`;
    if (!taken.has(next)) return next;
  }
  return `${root.slice(0, 28)}-${createId().slice(0, 8)}`;
}

export function isHidden(card: Card, key: FieldKey): boolean {
  return card.hidden.includes(key);
}

export function publicCard(card: Card): Card {
  const content = { ...card.content, services: [...card.content.services], actions: card.content.actions.map((action) => ({ ...action })) };
  for (const key of card.hidden) {
    if (key === "services") content.services = [];
    else if (key === "actions") content.actions = [];
    else content[key] = "";
  }
  return { ...card, hidden: [], content };
}

export function safeHttp(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function safeImage(value: string): string | null {
  if (/^data:image\/(jpeg|png|webp);base64,[a-z0-9+/]+={0,2}$/i.test(value) && value.length < 180_000) {
    return value;
  }
  return null;
}

export function displayHost(value: string): string {
  const href = safeHttp(value);
  if (!href) return value.trim();
  try {
    return new URL(href).host.replace(/^www\./, "");
  } catch {
    return value.trim();
  }
}

export function whatsappHref(value: string): string | null {
  const digits = value.replace(/[^\d]/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return `https://wa.me/${digits}`;
}

export function githubHref(value: string): string | null {
  const trimmed = value.trim().replace(/^@/, "");
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return safeHttp(trimmed);
  if (!/^[\w.-]+$/.test(trimmed)) return null;
  return `https://github.com/${trimmed}`;
}

export function mailHref(value: string): string | null {
  const email = value.trim();
  if (!/[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return `mailto:${email}`;
}

export function telHref(value: string): string | null {
  const phone = value.trim();
  if (!/^[+\d][\d\s().-]{5,}$/.test(phone)) return null;
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function vEsc(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

export function toVCard(card: Card): string {
  const view = publicCard(card);
  const { first, last } = splitName(view.content.fullName);
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${vEsc(last)};${vEsc(first)};;;`,
    `FN:${vEsc(view.content.fullName || "Contact")}`,
  ];
  if (view.content.company) lines.push(`ORG:${vEsc(view.content.company)}`);
  if (view.content.title) lines.push(`TITLE:${vEsc(view.content.title)}`);
  const email = mailHref(view.content.email);
  if (email) lines.push(`EMAIL;TYPE=INTERNET:${vEsc(view.content.email.trim())}`);
  const phone = telHref(view.content.phone);
  if (phone) lines.push(`TEL;TYPE=CELL:${vEsc(view.content.phone.trim())}`);
  const site = safeHttp(view.content.website);
  if (site) lines.push(`URL:${vEsc(site)}`);
  if (view.content.address) lines.push(`ADR;TYPE=WORK:;;${vEsc(view.content.address)};;;;`);
  const note = [view.content.headline, view.content.bio].filter(Boolean).join("\n");
  if (note) lines.push(`NOTE:${vEsc(note)}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export function downloadName(card: Card): string {
  const slug = slugify(publicCard(card).content.fullName || card.slug);
  return `${slug}.vcf`;
}

const packedSchema = z.object({
  slug: z.string().max(40),
  template: templateSchema,
  accent: accentSchema,
  font: fontSchema,
  published: z.boolean(),
  fullName: z.string().max(80).optional(),
  title: z.string().max(80).optional(),
  company: z.string().max(80).optional(),
  headline: z.string().max(140).optional(),
  bio: z.string().max(280).optional(),
  phone: z.string().max(32).optional(),
  email: z.string().max(120).optional(),
  website: z.string().max(200).optional(),
  whatsapp: z.string().max(32).optional(),
  linkedin: z.string().max(200).optional(),
  instagram: z.string().max(200).optional(),
  facebook: z.string().max(200).optional(),
  x: z.string().max(200).optional(),
  youtube: z.string().max(200).optional(),
  tiktok: z.string().max(200).optional(),
  github: z.string().max(120).optional(),
  address: z.string().max(120).optional(),
  mapUrl: z.string().max(200).optional(),
  hours: z.string().max(80).optional(),
  services: z.array(z.string().max(32)).max(8).optional(),
  portfolioUrl: z.string().max(200).optional(),
  bookingUrl: z.string().max(200).optional(),
  actions: z.array(z.object({ id: z.string().max(40), label: z.string().max(32), url: z.string().max(200) })).max(4).optional(),
});

function packPublic(card: Card): z.infer<typeof packedSchema> {
  const view = publicCard(card);
  const packed: z.infer<typeof packedSchema> = {
    slug: view.slug,
    template: view.template,
    accent: view.accent,
    font: view.font,
    published: view.published,
  };
  const copyKeys = [
    "fullName",
    "title",
    "company",
    "headline",
    "bio",
    "phone",
    "email",
    "website",
    "whatsapp",
    "linkedin",
    "instagram",
    "facebook",
    "x",
    "youtube",
    "tiktok",
    "github",
    "address",
    "mapUrl",
    "hours",
    "portfolioUrl",
    "bookingUrl",
  ] as const;
  for (const key of copyKeys) {
    if (view.content[key]) packed[key] = view.content[key];
  }
  if (view.content.services.length) packed.services = view.content.services;
  if (view.content.actions.length) packed.actions = view.content.actions;
  return packed;
}

export function encodeCard(card: Card): string {
  const json = JSON.stringify(packPublic(card));
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeCard(token: string): Card | null {
  try {
    const padded = token.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const binary = atob(padded + pad);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const parsed = packedSchema.safeParse(JSON.parse(new TextDecoder().decode(bytes)));
    if (!parsed.success || !parsed.data.published) return null;
    const content = emptyContent();
    const data = parsed.data;
    const copyKeys = [
      "fullName",
      "title",
      "company",
      "headline",
      "bio",
      "phone",
      "email",
      "website",
      "whatsapp",
      "linkedin",
      "instagram",
      "facebook",
      "x",
      "youtube",
      "tiktok",
      "github",
      "address",
      "mapUrl",
      "hours",
      "portfolioUrl",
      "bookingUrl",
    ] as const;
    for (const key of copyKeys) {
      if (data[key]) content[key] = data[key];
    }
    content.services = data.services ?? [];
    content.actions = data.actions ?? [];
    return {
      id: `shared-${data.slug}`,
      slug: data.slug,
      published: true,
      template: data.template,
      accent: data.accent,
      font: data.font,
      hidden: [],
      content,
    };
  } catch {
    return null;
  }
}

export function readShareHash(): Card | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash.startsWith("#p=")) return null;
  return decodeCard(decodeURIComponent(hash.slice(3)));
}

export function sharePath(card: Card): string {
  return `/c/${card.slug}#p=${encodeCard(card)}`;
}

export function isTemplateId(value: string): value is TemplateId {
  return TEMPLATES.some((item) => item.id === value);
}

export function isAccentId(value: string): value is AccentId {
  return ACCENTS.some((item) => item.id === value);
}

export function isFontId(value: string): value is FontId {
  return FONTS.some((item) => item.id === value);
}

export { fieldSchema };
