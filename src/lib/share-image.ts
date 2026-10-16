import { toDataURL } from "qrcode";
import {
  publicCardUrl,
  formatPhoneDisplay,
  getFullPhone,
  slugify,
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
  for (const item of items.slice(0, 3)) {
    const src =
      item.photoUrl ||
      showcaseImageUrl(item.text, cardType, item.style ?? "auto");
    if (!src) continue;
    try {
      const needsCors = src.startsWith("http");
      const img = await loadImage(src, needsCors);
      out.push({ img, label: item.text });
    } catch {
      // skip failed loads
    }
  }
  return out;
}

function typeLabel(cardType: string): string {
  const map: Record<string, string> = {
    personal: "Personal",
    business: "Business",
    company: "Company",
    org: "Organization",
    event: "Event",
    creator: "Creator",
  };
  return map[cardType] || "Card";
}

/** Draw original brand icons using SVG path data via Path2D */
function drawContactIcon(ctx: CanvasRenderingContext2D, x: number, y: number, kind: string) {
  const size = 26;
  const scale = size / 24;
  ctx.save();
  ctx.translate(x, y - 18);
  ctx.scale(scale, scale);

  if (kind === "WHATSAPP") {
    ctx.fillStyle = "#25D366";
    const p1 = new Path2D("M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1 0 1.2.9 2.4 1 2.5.1.2 1.8 2.8 4.4 3.9 2.6 1.1 2.6.7 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3z");
    const p2 = new Path2D("M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.4 5.1L2 22l5-1.3c1.5.8 3.1 1.3 5 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3C4.4 15.1 4 13.6 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8z");
    ctx.fill(p1);
    ctx.fill(p2);
  } else if (kind === "TELEGRAM") {
    ctx.fillStyle = "#26A5E4";
    const p = new Path2D("M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.6 6.5l-1.7 8c-.1.6-.5.7-1 .4l-2.8-2.1-1.4 1.3c-.1.1-.3.2-.5.2l.2-2.8 5.1-4.6c.2-.2 0-.3-.3-.1l-6.3 4-2.7-.8c-.6-.2-.6-.6.1-.9l10.5-4c.5-.2.9.1.8.9z");
    ctx.fill(p);
  } else if (kind === "INSTAGRAM") {
    ctx.fillStyle = "#E4405F";
    const p1 = new Path2D("M12 2.2c2.7 0 3 0 4.1.1 1 .1 1.5.2 1.9.4.5.2.8.4 1.2.8.4.4.6.7.8 1.2.2.4.3.9.4 1.9.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c-.1 1-.2 1.5-.4 1.9-.2.5-.4.8-.8 1.2-.4.4-.7.6-1.2.8-.4.2-.9.3-1.9.4-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-1-.1-1.5-.2-1.9-.4-.5-.2-.8-.4-1.2-.8-.4-.4-.6-.7-.8-1.2-.2-.4-.3-.9-.4-1.9-.1-1.1-.1-1.4-.1-4.1s0-3 .1-4.1c.1-1 .2-1.5.4-1.9.2-.5.4-.8.8-1.2.4-.4.7-.6 1.2-.8.4-.2.9-.3 1.9-.4 1.1-.1 1.4-.1 4.1-.1zM12 4c-2.6 0-2.9 0-4 .1-.9.1-1.4.2-1.7.3-.4.2-.7.4-.9.7-.3.2-.5.5-.7.9-.1.3-.2.8-.3 1.7-.1 1.1-.1 1.4-.1 4s0 2.9.1 4c.1.9.2 1.4.3 1.7.2.4.4.7.7.9.2.3.5.5.9.7.3.1.8.2 1.7.3 1.1.1 1.4.1 4 .1s2.9 0 4-.1c.9-.1 1.4-.2 1.7-.3.4-.2.7-.4.9-.7.3-.2.5-.5.7-.9.1-.3.2-.8.3-1.7.1-1.1.1-1.4.1-4s0-2.9-.1-4c-.1-.9-.2-1.4-.3-1.7-.2-.4-.4-.7-.7-.9-.2-.3-.5-.5-.9-.7-.3-.1-.8-.2-1.7-.3-1.1-.1-1.4-.1-4-.1z");
    const p2 = new Path2D("M12 7.4c-2.5 0-4.6 2.1-4.6 4.6s2.1 4.6 4.6 4.6 4.6-2.1 4.6-4.6-2.1-4.6-4.6-4.6zm0 7.6c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z");
    ctx.fill(p1);
    ctx.fill(p2);
    ctx.beginPath();
    ctx.arc(17.3, 6.7, 1.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "X" || kind === "TWITTER") {
    ctx.fillStyle = "#ffffff";
    const p = new Path2D("M18.2 2.2h3.3l-7.2 8.2 8.5 11.2h-6.7l-5.2-6.8-6 6.8H1.6l7.7-8.8L1.1 2.2h6.9l4.7 6.2 5.5-6.2zm-1.2 17.4h1.8L7.1 4h-2L17 19.6z");
    ctx.fill(p);
  } else if (kind === "EMAIL") {
    ctx.fillStyle = "#c6a36e";
    ctx.beginPath();
    ctx.roundRect(2, 4, 20, 16, 2);
    ctx.fill();
    ctx.strokeStyle = "#1c1915";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(3, 6);
    ctx.lineTo(12, 13);
    ctx.lineTo(21, 6);
    ctx.stroke();
  } else if (kind === "PHONE") {
    ctx.fillStyle = "#c6a36e";
    ctx.beginPath();
    ctx.roundRect(7, 2, 10, 20, 2);
    ctx.fill();
    ctx.fillStyle = "#1c1915";
    ctx.fillRect(10, 18, 4, 2);
  } else {
    ctx.fillStyle = "#888";
    ctx.beginPath();
    ctx.arc(12, 12, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/** Balanced share image: tight header, showcase grid, contact rows, fixed QR zone. */
export async function renderCardImage(profile: Profile): Promise<Blob> {
  const showcase = profile.showcase ?? [];
  const loaded = await loadShowcaseImages(showcase, profile.cardType || "personal");
  const hasShowcase = loaded.length > 0;
  const hasFocus = (profile.focus ?? []).length > 0;
  const hasScan = Boolean(profile.scanMessage?.trim());

  const w = 1080;
  let contentH = 420;
  if (profile.role) contentH += 44;
  if (profile.tagline) contentH += 70;
  if (hasFocus) contentH += 56;
  if (hasScan) contentH += 64;
  contentH += 36;
  if (hasShowcase) contentH += 40 + 220 + 48;
  const contactCount = [
    profile.email,
    getFullPhone(profile),
    profile.whatsapp,
    profile.telegram,
    profile.linkedin,
    profile.instagram,
    profile.x,
    profile.website,
    profile.location,
  ].filter(Boolean).length;
  contentH += Math.min(contactCount, 6) * 48 + 24;
  const qrZone = 420;
  const h = Math.max(1480, contentH + qrZone);

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
  const pad = 72;

  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = t.accent;
  ctx.fillRect(0, 0, w, 10);

  // Header
  const monogramY = 118;
  ctx.strokeStyle = t.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(pad + 44, monogramY, 44, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = t.accent;
  ctx.font = "600 28px system-ui, sans-serif";
  ctx.textAlign = "center";
  const initials = (profile.fullName || "?")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  ctx.fillText(initials, pad + 44, monogramY + 10);
  ctx.textAlign = "left";

  const org = (profile.organization || typeLabel(profile.cardType || "personal")).slice(0, 28);
  ctx.fillStyle = t.mute;
  ctx.font = "500 22px system-ui, sans-serif";
  ctx.fillText(org, pad + 108, monogramY + 8);

  const badge = typeLabel(profile.cardType || "personal");
  ctx.font = "500 20px system-ui, sans-serif";
  const badgeW = ctx.measureText(badge).width + 36;
  const badgeX = w - pad - badgeW;
  const badgeY = monogramY - 22;
  ctx.strokeStyle = t.accent;
  ctx.lineWidth = 2;
  roundRect(ctx, badgeX, badgeY, badgeW, 44, 22);
  ctx.stroke();
  ctx.fillStyle = t.accent;
  ctx.textAlign = "center";
  ctx.fillText(badge, badgeX + badgeW / 2, badgeY + 29);
  ctx.textAlign = "left";

  let y = 220;
  ctx.fillStyle = t.fg;
  ctx.font = "600 58px Georgia, 'Times New Roman', serif";
  y = wrapText(ctx, (profile.fullName || "Your name").slice(0, 36), pad, y, w - pad * 2, 68) + 12;

  if (profile.role) {
    ctx.fillStyle = t.accent;
    ctx.font = "500 28px system-ui, sans-serif";
    ctx.fillText(profile.role.slice(0, 48), pad, y);
    y += 42;
  }

  if (profile.tagline) {
    ctx.fillStyle = t.mute;
    ctx.font = "400 24px system-ui, sans-serif";
    y = wrapText(ctx, profile.tagline.slice(0, 120), pad, y, w - pad * 2, 34) + 16;
  }

  if (hasFocus) {
    let cx = pad;
    const cy = y;
    ctx.font = "500 18px system-ui, sans-serif";
    for (const tag of profile.focus.slice(0, 4)) {
      const tw = ctx.measureText(tag).width + 28;
      if (cx + tw > w - pad) break;
      roundRect(ctx, cx, cy - 22, tw, 36, 18);
      ctx.strokeStyle = t.mute;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = t.mute;
      ctx.fillText(tag, cx + 14, cy + 2);
      cx += tw + 12;
    }
    y += 52;
  }

  if (hasScan) {
    const msg = profile.scanMessage!.trim().slice(0, 90);
    ctx.font = "400 22px system-ui, sans-serif";
    const mw = Math.min(w - pad * 2, ctx.measureText(msg).width + 48);
    roundRect(ctx, pad, y - 8, mw, 48, 14);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fill();
    ctx.strokeStyle = t.mute;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = t.fg;
    ctx.fillText(msg, pad + 20, y + 24);
    y += 64;
  }

  y += 8;
  ctx.strokeStyle = t.mute;
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(w - pad, y);
  ctx.stroke();
  ctx.globalAlpha = 1;
  y += 32;

  if (hasShowcase) {
    ctx.fillStyle = t.accent;
    ctx.beginPath();
    ctx.arc(pad + 6, y - 6, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = t.mute;
    ctx.font = "600 16px system-ui, sans-serif";
    ctx.fillText("SHOWCASE", pad + 20, y);
    y += 28;

    const gap = 20;
    const count = loaded.length;
    const thumbW = Math.floor((w - pad * 2 - gap * (count - 1)) / count);
    const thumbH = Math.floor(thumbW * 0.72);
    let x = pad;
    for (const { img, label } of loaded) {
      ctx.save();
      roundRect(ctx, x, y, thumbW, thumbH, 16);
      ctx.clip();
      const scale = Math.max(thumbW / img.width, thumbH / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, x + (thumbW - dw) / 2, y + (thumbH - dh) / 2, dw, dh);
      ctx.restore();

      ctx.strokeStyle = t.mute;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, thumbW, thumbH, 16);
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.fillStyle = t.mute;
      ctx.font = "400 15px system-ui, sans-serif";
      const cap = label.length > 26 ? label.slice(0, 24) + "…" : label;
      ctx.fillText(cap, x, y + thumbH + 26);
      x += thumbW + gap;
    }
    y += thumbH + 52;
  }

  // Contacts with original icons
  const phone = formatPhoneDisplay(profile) || getFullPhone(profile);
  const rows: [string, string][] = [];
  if (profile.email) rows.push(["EMAIL", profile.email]);
  if (phone) rows.push(["PHONE", phone]);
  if (profile.whatsapp) rows.push(["WHATSAPP", profile.whatsapp]);
  if (profile.telegram) rows.push(["TELEGRAM", profile.telegram.replace(/^@/, "")]);
  if (profile.instagram) rows.push(["INSTAGRAM", profile.instagram.replace(/^@/, "")]);
  if (profile.x) rows.push(["X", profile.x.replace(/^@/, "")]);
  if (profile.website) {
    let web = profile.website.replace(/^https?:\/\//i, "").replace(/\/$/, "");
    if (web.length > 40) web = web.slice(0, 38) + "…";
    rows.push(["WEB", web]);
  }
  if (profile.location) rows.push(["BASE", profile.location]);
  if (profile.linkedin) rows.push(["LINKEDIN", profile.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "")]);

  const iconX = pad;
  const labelX = pad + 40;
  const valueX = pad + 210;
  const contactLimit = h - qrZone - 20;

  for (const [label, value] of rows.slice(0, 7)) {
    if (y + 44 > contactLimit) break;
    drawContactIcon(ctx, iconX, y, label);
    ctx.fillStyle = t.accent;
    ctx.font = "600 16px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(label, labelX, y);
    ctx.fillStyle = t.fg;
    ctx.font = "400 24px system-ui, sans-serif";
    ctx.fillText(value.slice(0, 38), valueX, y);
    y += 48;
  }

  // QR
  const link = typeof window !== "undefined" ? publicCardUrl(profile) : "";
  const qrValue = link || "https://calling-card.app";
  const slug = slugify(profile.username || profile.fullName) || "card";

  try {
    const qrDataUrl = await toDataURL(qrValue, {
      margin: 2,
      width: 400,
      errorCorrectionLevel: "M",
      color: { dark: "#111111", light: "#ffffff" },
    });
    const qrImg = await loadImage(qrDataUrl);
    const qrSize = 280;
    const plate = 20;
    const qrX = (w - qrSize) / 2;
    const qrY = h - qrSize - plate * 2 - 88;

    ctx.fillStyle = "#ffffff";
    roundRect(ctx, qrX - plate, qrY - plate, qrSize + plate * 2, qrSize + plate * 2, 24);
    ctx.fill();
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    ctx.fillStyle = t.accent;
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Scan to open full card + gallery", w / 2, qrY + qrSize + plate + 36);
    ctx.fillStyle = t.mute;
    ctx.font = "400 18px system-ui, sans-serif";
    ctx.fillText(`/u/${slug}  ·  calling card`, w / 2, qrY + qrSize + plate + 64);
    ctx.textAlign = "left";
  } catch {
    ctx.fillStyle = t.mute;
    ctx.font = "400 20px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText((link || "calling card").slice(0, 60), w / 2, h - 40);
    ctx.textAlign = "left";
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
): number {
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
  if (line) {
    ctx.fillText(line, x, yy);
    yy += lineHeight;
  }
  return yy;
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
