import { decodeProfile, type Profile } from "@/lib/profile";

export type ScanResult =
  | { kind: "card-slug"; slug: string; url: string }
  | { kind: "card-hash"; profile: Profile; url: string }
  | { kind: "mecard"; raw: string }
  | { kind: "external-url"; url: string }
  | { kind: "unknown"; raw: string };

const OUR_HOST_HINTS = [
  "digital-business-card",
  "vercel.app",
  "localhost",
  "127.0.0.1",
];

function isLikelyOurHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return OUR_HOST_HINTS.some((hint) => h.includes(hint));
}

/** Parse raw QR text into a structured result for this app. */
export function parseScannedQr(raw: string): ScanResult {
  const text = raw.trim();
  if (!text) return { kind: "unknown", raw: text };

  // MeCard contact payload (from our "Save contact" QR mode)
  if (/^MECARD:/i.test(text)) {
    return { kind: "mecard", raw: text };
  }

  // Absolute or scheme-relative URL
  let url: URL | null = null;
  try {
    if (/^https?:\/\//i.test(text)) {
      url = new URL(text);
    } else if (text.startsWith("/") && typeof window !== "undefined") {
      url = new URL(text, window.location.origin);
    }
  } catch {
    url = null;
  }

  if (url) {
    // /u/:slug with optional hash
    const slugMatch = url.pathname.match(/^\/u\/([^/]+)\/?$/i);
    if (slugMatch) {
      const slug = decodeURIComponent(slugMatch[1]);
      const hash = url.hash || "";
      if (hash.startsWith("#c=")) {
        const profile = decodeProfile(hash.slice(3));
        if (profile) {
          return { kind: "card-hash", profile, url: url.href };
        }
      }
      return { kind: "card-slug", slug, url: url.href };
    }

    // Same-origin path with #c= only
    if (url.hash.startsWith("#c=")) {
      const profile = decodeProfile(url.hash.slice(3));
      if (profile) {
        return { kind: "card-hash", profile, url: url.href };
      }
    }

    // Foreign URL
    if (!isLikelyOurHost(url.hostname) && typeof window !== "undefined") {
      if (url.origin !== window.location.origin) {
        return { kind: "external-url", url: url.href };
      }
    }

    return { kind: "external-url", url: url.href };
  }

  // Bare #c= token
  if (text.startsWith("#c=")) {
    const profile = decodeProfile(text.slice(3));
    if (profile) {
      return {
        kind: "card-hash",
        profile,
        url: typeof window !== "undefined" ? `${window.location.origin}/${text}` : text,
      };
    }
  }

  // Bare base64-ish payload that might be a profile token
  if (/^[A-Za-z0-9_-]{20,}$/.test(text)) {
    const profile = decodeProfile(text);
    if (profile && (profile.fullName || profile.username || profile.email)) {
      return {
        kind: "card-hash",
        profile,
        url: typeof window !== "undefined" ? `${window.location.origin}/#c=${text}` : text,
      };
    }
  }

  return { kind: "unknown", raw: text };
}
