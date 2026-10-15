import type { CardTypeId } from "@/lib/profile";

export const SHOWCASE_STYLES = [
  { id: "auto", label: "Auto", hint: "Match card type and your words" },
  { id: "outfit", label: "Outfit", hint: "Fashion, dress, uniform, look" },
  { id: "product", label: "Product", hint: "Item, tool, package, gear" },
  { id: "food", label: "Food", hint: "Meals, cake, catering, drinks" },
  { id: "event", label: "Event", hint: "Party, venue, celebration" },
  { id: "workspace", label: "Workspace", hint: "Studio, tools, desk, shop" },
  { id: "portrait", label: "Portrait", hint: "Professional person look" },
] as const;

export type ShowcaseStyleId = (typeof SHOWCASE_STYLES)[number]["id"];

export type ShowcaseItem = {
  id: string;
  text: string;
  style?: ShowcaseStyleId;
  /** Optional own photo (data URL or https) — overrides generated image */
  photoUrl?: string;
};

export const SHOWCASE_MAX = 6;
export const SHOWCASE_TEXT_MAX = 64;

export function createShowcaseId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isShowcaseStyleId(value: string): value is ShowcaseStyleId {
  return SHOWCASE_STYLES.some((s) => s.id === value);
}

export function seedFromText(text: string, style: string = "auto"): number {
  let h = 2166136261;
  const s = `${text.trim().toLowerCase()}|${style}`;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h % 1_000_000);
}

function styleHintFromCardType(cardType: CardTypeId): string {
  switch (cardType) {
    case "business":
    case "company":
    case "org":
      return "professional product or service presentation, clean studio lighting, commercial photography";
    case "creator":
      return "creative portfolio style, modern aesthetic, high quality photography";
    case "event":
      return "event atmosphere, festive but tasteful, professional event photo";
    case "personal":
    default:
      return "clean professional lifestyle or craft presentation, soft studio light";
  }
}

function styleHintFromPick(style: ShowcaseStyleId, cardType: CardTypeId): string {
  switch (style) {
    case "outfit":
      return "fashion outfit full body or three-quarter view, clothing focus, studio or clean background, no face watermark";
    case "product":
      return "product photography on clean surface, commercial catalog style, single product hero shot";
    case "food":
      return "appetizing food photography, plated dish or spread, soft natural light";
    case "event":
      return "event atmosphere, celebration or gathering, tasteful professional event photo";
    case "workspace":
      return "workspace tools or studio craft setup, professional work environment";
    case "portrait":
      return "professional portrait style, confident pose, clean background, business casual";
    case "auto":
    default:
      return styleHintFromCardType(cardType);
  }
}

export function suggestStyleFromText(text: string): ShowcaseStyleId {
  const t = text.toLowerCase();
  if (/(dress|gown|outfit|lace|aso|owambe|gele|agbada|suit|uniform|corset|bridal|fashion|blouse|ankara)/.test(t))
    return "outfit";
  if (/(cake|food|cater|menu|snack|meal|rice|soup|drink|buffet|small chops)/.test(t)) return "food";
  if (/(party|wedding|event|reception|concert|launch)/.test(t)) return "event";
  if (/(studio|workshop|tool|desk|laptop|machine|sewing|garage)/.test(t)) return "workspace";
  if (/(portrait|headshot|profile photo|professional photo)/.test(t)) return "portrait";
  if (/(product|package|gadget|device|kit|box|bottle)/.test(t)) return "product";
  return "auto";
}

export function showcaseImageUrl(
  text: string,
  cardType: CardTypeId = "personal",
  style: ShowcaseStyleId = "auto",
): string {
  const cleaned = text.trim().slice(0, SHOWCASE_TEXT_MAX);
  if (!cleaned) return "";
  const resolved = style === "auto" ? suggestStyleFromText(cleaned) : style;
  const prompt = [
    cleaned,
    styleHintFromPick(resolved === "auto" ? "auto" : resolved, cardType),
    "single subject, centered, vertical composition, no text, no watermark, no logo",
  ].join(", ");
  const seed = seedFromText(cleaned, resolved);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=384&height=512&nologo=true&seed=${seed}`;
}

export function normalizeShowcase(items: unknown): ShowcaseItem[] {
  if (!Array.isArray(items)) return [];
  const out: ShowcaseItem[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue;
    const obj = raw as { id?: unknown; text?: unknown; style?: unknown; photoUrl?: unknown };
    const text = typeof obj.text === "string" ? obj.text.trim().slice(0, SHOWCASE_TEXT_MAX) : "";
    if (!text) continue;
    const id =
      typeof obj.id === "string" && obj.id ? obj.id : createShowcaseId();
    const style =
      typeof obj.style === "string" && isShowcaseStyleId(obj.style) ? obj.style : "auto";
    const photoUrl =
      typeof obj.photoUrl === "string" && obj.photoUrl.trim().startsWith("data:image")
        ? obj.photoUrl.trim().slice(0, 600_000)
        : typeof obj.photoUrl === "string" && obj.photoUrl.trim().startsWith("https://")
          ? obj.photoUrl.trim().slice(0, 500)
          : undefined;
    out.push({ id, text, style, ...(photoUrl ? { photoUrl } : {}) });
    if (out.length >= SHOWCASE_MAX) break;
  }
  return out;
}

export function nameSizeClass(cardType: CardTypeId, hasShowcase: boolean): string {
  if (cardType === "personal") {
    return hasShowcase
      ? "font-display text-2xl sm:text-3xl leading-tight font-medium text-balance text-card-fg"
      : "font-display text-3xl leading-tight font-medium text-balance text-card-fg";
  }
  if (cardType === "company" || cardType === "org") {
    return "font-display text-3xl sm:text-4xl leading-tight font-medium text-balance text-card-fg";
  }
  return hasShowcase
    ? "font-display text-3xl sm:text-4xl leading-tight font-medium text-balance text-card-fg"
    : "font-display text-4xl leading-tight font-medium text-balance text-card-fg";
}
