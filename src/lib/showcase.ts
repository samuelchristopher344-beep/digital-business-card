import type { CardTypeId } from "@/lib/profile";

export type ShowcaseItem = {
  id: string;
  /** What the user wrote — drives the generated look */
  text: string;
};

export const SHOWCASE_MAX = 6;
export const SHOWCASE_TEXT_MAX = 64;

export function createShowcaseId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Stable seed so the same text keeps a consistent image. */
export function seedFromText(text: string): number {
  let h = 2166136261;
  const s = text.trim().toLowerCase();
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h % 1_000_000);
}

function styleHint(cardType: CardTypeId): string {
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

/**
 * Build an image URL from the user's own words.
 * Uses a public prompt-to-image endpoint (no API key).
 * Images are illustrative — not photos of real clients.
 */
export function showcaseImageUrl(text: string, cardType: CardTypeId = "personal"): string {
  const cleaned = text.trim().slice(0, SHOWCASE_TEXT_MAX);
  if (!cleaned) return "";
  const prompt = [
    cleaned,
    styleHint(cardType),
    "single subject, centered, vertical composition, no text, no watermark, no logo",
  ].join(", ");
  const seed = seedFromText(cleaned);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=384&height=512&nologo=true&seed=${seed}`;
}

export function normalizeShowcase(items: unknown): ShowcaseItem[] {
  if (!Array.isArray(items)) return [];
  const out: ShowcaseItem[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue;
    const obj = raw as { id?: unknown; text?: unknown };
    const text = typeof obj.text === "string" ? obj.text.trim().slice(0, SHOWCASE_TEXT_MAX) : "";
    if (!text) continue;
    const id =
      typeof obj.id === "string" && obj.id
        ? obj.id
        : createShowcaseId();
    out.push({ id, text });
    if (out.length >= SHOWCASE_MAX) break;
  }
  return out;
}
