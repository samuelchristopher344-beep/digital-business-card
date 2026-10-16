import { toDataURL } from "qrcode";
import {
  publicCardUrl,
  formatPhoneDisplay,
  getFullPhone,
  type Profile,
} from "./profile";
import { showcaseImageUrl, type ShowcaseItem } from "./showcase";

function loadImage(src: string, crossOrigin = false): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

async function loadShowcaseImages(
  items: ShowcaseItem[],
  cardType: Profile["cardType"],
): Promise<{ img: HTMLImageElement; label: string }[]> {
  const out: { img: HTMLImageElement; label: string }[] = [];
  for (const item of items.slice(0, 4)) {
    const src =
      item.photoUrl ||
      showcaseImageUrl(item.text, cardType, item.style ?? "auto");
    if (!src) continue;
    try {
      const needsCors = src.startsWith("http");
      const img = await loadImage(src, needsCors);
      out.push({ img, label: item.text });
    } catch {
      // Skip failed external/generated images; keep sharing reliable
    }
  }
  return out;
}

/** Draw a clear, shareable card image that looks like the real card + QR + showcase. */
export async function renderCardImage(profile: Profile): Promise<Blob> {
  const showcase = profile.showcase ?? [];
  const loaded = await loadShowcaseImages(showcase, profile.cardType || "personal");
  const hasShowcase = loaded.length > 0;

  const w = 1080;
  const h = hasShowcase ? 1920 : 1480;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");

  const themes: Record<string, { bg: string; fg: string; mute: string; accent: string }> = {
    brass: { bg: "#1c1915", fg: "#f6f1e8", mute: "#d2c8bc", accent: "#c6a36e" },
    signal: { bg: "#12181f", fg: "#e8f0f5", mute: "#b7c6ce", accent: "#7dbeb8" },
    tide: { bg: "#0f1c1a", fg: "#e6f4f2", mute: "#a8d5d0", accent: "#5aa8a0" },
    ink: { bg: "#111111", fg: "#f5f5f5", mute: "#a3a3a3", accent: "#e5e5e5" },
  };
  const t = themes[profile.theme] || themes.brass;

  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = t.accent;
  ctx.fillRect(0, 0, w, 12);

  // Initials circle — accent ring (matches live card monogram)
  ctx.strokeStyle = t.accent;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(140, 160, 52, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = t.accent;
  ctx.font = "600 34px system-ui, sans-serif";
  ctx.textAlign = "center";
  const initials = (profile.fullName || "?")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  ctx.fillText(initials, 140, 172);
  ctx.textAlign = "left";

  ctx.fillStyle = t.mute;
  ctx.font = "500 22px system-ui, sans-serif";
  ctx.fillText((profile.organization || profile.cardType || "Calling Card").slice(0, 36), 220, 150);

  ctx.fillStyle = t.fg;
  ctx.font = "600 64px Georgia, serif";
  wrapText(ctx, (profile.fullName || "Your name").slice(0, 40), 80, 320, w - 160, 76);

  let y = 480;
  if (profile.role) {
    ctx.fillStyle = t.accent;
    ctx.font = "500 30px system-ui, sans-serif";
    ctx.fillText(profile.role.slice(0, 50), 80, y);
    y += 48;
  }

  if (profile.tagline) {
    ctx.fillStyle = t.mute;
    ctx.font = "400 26px system-ui, sans-serif";
    wrapText(ctx, profile.tagline.slice(0, 140), 80, y, w - 160, 36);
    y += 80;
  }

  if (hasShowcase) {
    ctx.strokeStyle = t.mute;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(80, y);
    ctx.lineTo(w - 80, y);
    ctx.stroke();
    ctx.globalAlpha = 1;
    y += 36;

    ctx.fillStyle = t.mute;
    ctx.font = "500 18px system-ui, sans-serif";
    ctx.fillText("SHOWCASE", 80, y);
    y += 28;

    const gap = 20;
    const count = loaded.length;
    const thumbW = Math.min(220, Math.floor((w - 160 - gap * (count - 1)) / count));
    const thumbH = Math.floor(thumbW * (4 / 3));
    let x = 80;
    for (const { img, label } of loaded) {
      ctx.save();
      roundRect(ctx, x, y, thumbW, thumbH, 18);
      ctx.clip();
      const scale = Math.max(thumbW / img.width, thumbH / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = x + (thumbW - dw) / 2;
      const dy = y + (thumbH - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();

      ctx.strokeStyle = t.mute;
      ctx.globalAlpha = 0.35;
      roundRect(ctx, x, y, thumbW, thumbH, 18);
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.fillStyle = t.mute;
      ctx.font = "400 16px system-ui, sans-serif";
      const cap = label.length > 22 ? label.slice(0, 20) + "…" : label;
      ctx.fillText(cap, x, y + thumbH + 22);

      x += thumbW + gap;
    }
    y += thumbH + 48;
  } else {
    ctx.strokeStyle = t.mute;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(80, y);
    ctx.lineTo(w - 80, y);
    ctx.stroke();
    ctx.globalAlpha = 1;
    y += 48;
  }

  const contactBottomLimit = h - 480;
  const phone = formatPhoneDisplay(profile) || getFullPhone(profile);
  const rows: [string, string][] = [];
  if (profile.email) rows.push(["Email", profile.email]);
  if (phone) rows.push(["Phone", phone]);
  if (profile.whatsapp) rows.push(["WhatsApp", profile.whatsapp]);
  if (profile.telegram) rows.push(["Telegram", profile.telegram.replace(/^@/, "")]);
  if (profile.linkedin) rows.push(["LinkedIn", profile.linkedin]);
  if (profile.instagram) rows.push(["Instagram", profile.instagram.replace(/^@/, "")]);
  if (profile.x) rows.push(["X", profile.x.replace(/^@/, "")]);
  if (profile.website) rows.push(["Web", profile.website]);
  if (profile.location) rows.push(["Base", profile.location]);

  for (const [label, value] of rows) {
    if (y + 60 > contactBottomLimit) break;
    ctx.fillStyle = t.mute;
    ctx.font = "500 18px system-ui, sans-serif";
    ctx.fillText(label.toUpperCase(), 80, y);
    ctx.fillStyle = t.fg;
    ctx.font = "400 28px system-ui, sans-serif";
    ctx.fillText(value.slice(0, 42), 80, y + 32);
    y += 64;
  }

  const link = typeof window !== "undefined" ? publicCardUrl(profile) : "";
  const qrValue = link || "https://calling-card.app";

  try {
    const qrDataUrl = await toDataURL(qrValue, {
      margin: 2,
      width: 400,
      errorCorrectionLevel: "M",
      color: { dark: "#111111", light: "#ffffff" },
    });
    const qrImg = await loadImage(qrDataUrl);

    const qrSize = 320;
    const pad = 24;
    const qrX = (w - qrSize) / 2;
    const qrY = h - qrSize - pad * 2 - 56;

    ctx.fillStyle = "#ffffff";
    roundRect(ctx, qrX - pad, qrY - pad, qrSize + pad * 2, qrSize + pad * 2, 28);
    ctx.fill();

    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    ctx.fillStyle = t.mute;
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Scan to open card", w / 2, qrY + qrSize + pad + 34);
    ctx.textAlign = "left";
  } catch {
    ctx.fillStyle = t.mute;
    ctx.font = "400 20px system-ui, sans-serif";
    ctx.fillText((link || "calling card").slice(0, 70), 80, h - 40);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not export image"))),
      "image/jpeg",
      0.92,
    );
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
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
  const filename = `${(profile.fullName || "calling-card").replace(/\s+/g, "-").toLowerCase()}.jpg`;

  if ("showSaveFilePicker" in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: "JPEG image", accept: { "image/jpeg": [".jpg", ".jpeg"] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch {
      // cancelled
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
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
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  } catch {
    return false;
  }
}

export async function shareCardImage(
  profile: Profile,
): Promise<"shared" | "downloaded" | "aborted" | "unsupported"> {
  const blob = await renderCardImage(profile);
  const file = new File([blob], "calling-card.jpg", { type: "image/jpeg" });
  const nav = navigator as Navigator & {
    share?: (d: ShareData) => Promise<void>;
  };

  if (canNativeShareFiles(file) && nav.share) {
    try {
      await nav.share({
        files: [file],
        title: profile.fullName || "Calling Card",
        text: profile.role || profile.tagline || "My calling card",
      });
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "aborted";
    }
  }
  return "unsupported";
}

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
