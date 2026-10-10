import { publicCardUrl, type Profile } from "./profile";

/** Draw a shareable card image (no extra dependencies). */
export async function renderCardImage(profile: Profile): Promise<Blob> {
  const w = 1080;
  const h = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");

  // Background
  ctx.fillStyle = "#1a1714";
  ctx.fillRect(0, 0, w, h);

  // Accent bar
  ctx.fillStyle = "#c6a36e";
  ctx.fillRect(0, 0, w, 16);

  ctx.fillStyle = "#f6f1e8";
  ctx.font = "600 28px system-ui, sans-serif";
  ctx.fillText((profile.organization || "Calling Card").slice(0, 40), 64, 100);

  ctx.font = "600 72px Georgia, serif";
  const name = (profile.fullName || "Your name").slice(0, 32);
  wrapText(ctx, name, 64, 220, w - 128, 84);

  ctx.fillStyle = "#c6a36e";
  ctx.font = "500 32px system-ui, sans-serif";
  if (profile.role) ctx.fillText(profile.role.slice(0, 48), 64, 420);

  ctx.fillStyle = "#c4bbb0";
  ctx.font = "400 28px system-ui, sans-serif";
  if (profile.tagline) wrapText(ctx, profile.tagline.slice(0, 120), 64, 480, w - 128, 40);

  let y = 620;
  ctx.fillStyle = "#f6f1e8";
  ctx.font = "400 26px system-ui, sans-serif";
  const lines = [
    profile.email && `✉  ${profile.email}`,
    profile.phone && `☎  ${profile.phone}`,
    profile.website && `🌐  ${profile.website}`,
    profile.location && `⌖  ${profile.location}`,
  ].filter(Boolean) as string[];
  for (const line of lines) {
    ctx.fillText(line.slice(0, 50), 64, y);
    y += 48;
  }

  ctx.fillStyle = "#5c564e";
  ctx.font = "400 22px system-ui, sans-serif";
  const link = typeof window !== "undefined" ? publicCardUrl(profile) : "";
  ctx.fillText((link || "calling card").slice(0, 60), 64, h - 64);

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not export image"))), "image/png");
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
}

export async function downloadCardImage(profile: Profile) {
  const blob = await renderCardImage(profile);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(profile.fullName || "card").replace(/\s+/g, "-").toLowerCase()}.png`;
  a.click();
  URL.revokeObjectURL(url);
}

function canNativeShareFiles(file: File): boolean {
  const nav = navigator as Navigator & {
    canShare?: (d: { files: File[] }) => boolean;
    share?: (d: ShareData) => Promise<void>;
  };
  if (!nav.share) return false;
  try {
    if (typeof nav.canShare === "function") {
      return nav.canShare({ files: [file] });
    }
    // Some browsers expose share but not canShare; try optimistically on mobile
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  } catch {
    return false;
  }
}

/**
 * Prefer the OS share sheet (WhatsApp, etc.). Returns:
 * - "shared" when the native sheet was used successfully
 * - "aborted" when the user cancelled
 * - "unsupported" when native file share is not available (caller should show custom sheet)
 */
export async function shareCardImage(profile: Profile): Promise<"shared" | "downloaded" | "aborted" | "unsupported"> {
  const blob = await renderCardImage(profile);
  const file = new File([blob], "calling-card.png", { type: "image/png" });
  const nav = navigator as Navigator & {
    share?: (d: ShareData) => Promise<void>;
  };

  if (canNativeShareFiles(file) && nav.share) {
    try {
      await nav.share({
        files: [file],
        title: profile.fullName || "Calling Card",
        text: profile.role || profile.tagline || "My calling card",
        url: publicCardUrl(profile),
      });
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "aborted";
      // fall through to unsupported so UI can show the custom sheet
    }
  }
  return "unsupported";
}

/** Try native share for a link; returns true if the OS sheet opened. */
export async function tryNativeShareLink(opts: {
  title: string;
  text?: string;
  url: string;
}): Promise<"shared" | "aborted" | "unsupported"> {
  if (!navigator.share) return "unsupported";
  try {
    await navigator.share({
      title: opts.title,
      text: opts.text,
      url: opts.url,
    });
    return "shared";
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return "aborted";
    return "unsupported";
  }
}
