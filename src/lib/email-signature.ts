import { publicCardUrl, type Profile } from "./profile";

export function emailSignatureText(profile: Profile): string {
  const url = typeof window !== "undefined" ? publicCardUrl(profile) : "";
  return [
    profile.fullName || "",
    [profile.role, profile.organization].filter(Boolean).join(" · "),
    profile.email || "",
    profile.phone || "",
    url,
  ]
    .filter(Boolean)
    .join("\n");
}

export function emailSignatureHtml(profile: Profile): string {
  const url = typeof window !== "undefined" ? publicCardUrl(profile) : "#";
  const safe = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<div style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.45;color:#1a1714">
  <strong style="font-size:16px">${safe(profile.fullName || "")}</strong><br/>
  <span style="color:#5c564e">${safe([profile.role, profile.organization].filter(Boolean).join(" · "))}</span><br/>
  ${profile.email ? `<a href="mailto:${safe(profile.email)}">${safe(profile.email)}</a><br/>` : ""}
  ${profile.phone ? `${safe(profile.phone)}<br/>` : ""}
  <a href="${safe(url)}" style="color:#6b471f">Digital card</a>
</div>`;
}

export async function copyEmailSignature(profile: Profile, asHtml = false) {
  const text = emailSignatureText(profile);
  if (asHtml && typeof ClipboardItem !== "undefined") {
    try {
      const html = emailSignatureHtml(profile);
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob([text], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" }),
        }),
      ]);
      return;
    } catch {
      // fall through
    }
  }
  await navigator.clipboard.writeText(text);
}
