import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Download, RotateCcw, Share2, X } from "lucide-react";
import { CallingCard } from "@/components/calling-card";
import { QrMark } from "@/components/qr-mark";
import {
  DEFAULT_PROFILE,
  THEMES,
  downloadFileName,
  readHashProfile,
  readStoredProfile,
  shareUrl,
  toMeCard,
  toVCard,
  writeHash,
  writeStoredProfile,
  type Profile,
  type ThemeId,
} from "@/lib/profile";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [booted, setBooted] = useState(false);
  const [qrMode, setQrMode] = useState<"card" | "contact">("card");
  const [notice, setNotice] = useState("");
  const [focusDraft, setFocusDraft] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    const next = readHashProfile() ?? readStoredProfile() ?? DEFAULT_PROFILE;
    setProfile(next);
    writeStoredProfile(next);
    writeHash(next);
    setLink(shareUrl(next));
    setBooted(true);
  }, []);

  useEffect(() => {
    if (!booted) return;
    writeStoredProfile(profile);
    writeHash(profile);
    setLink(shareUrl(profile));
  }, [profile, booted]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function addFocus() {
    const next = focusDraft.trim().slice(0, 24);
    if (!next || profile.focus.length >= 6) return;
    if (profile.focus.some((item) => item.toLowerCase() === next.toLowerCase())) {
      setFocusDraft("");
      return;
    }
    update("focus", [...profile.focus, next]);
    setFocusDraft("");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl(profile));
    setNotice("Link copied");
  }

  async function shareCard() {
    const url = shareUrl(profile);
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile.fullName || "Calling Card",
          text: profile.role || profile.tagline,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(url);
    setNotice("Link copied");
  }

  function saveContact() {
    const blob = new Blob([toVCard(profile)], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = downloadFileName(profile);
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Contact file saved");
  }

  const qrValue = qrMode === "contact" ? toMeCard(profile) : link;
  const qrLabel =
    qrMode === "contact" ? "QR code that saves this person as a contact" : "QR code that opens this calling card";

  return (
    <main data-theme={profile.theme} className="min-h-screen text-ink">
      <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-5 lg:items-start lg:gap-8 lg:py-12">
        <div className="lg:sticky lg:top-8 lg:col-span-2">
          <header className="mb-5">
            <p className="text-xs font-medium tracking-widest text-mute uppercase">Calling card</p>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              Seeded from the public christoflightX-1 profile. Change it here — the link and QR update with you.
            </p>
          </header>
          <CallingCard profile={profile} />
        </div>

        <div className="flex min-w-0 flex-col gap-6 lg:col-span-3">
          <section className="rounded-card border border-line bg-cream p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl leading-tight">Hand it over</h2>
                <p className="mt-1 text-sm leading-relaxed text-mute">
                  Scan to open the card, or switch the code so a phone can save the contact.
                </p>
              </div>
              <span className="sr-only" aria-live="polite">
                {notice}
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="sm:w-52 sm:shrink-0">
                {qrValue ? <QrMark value={qrValue} label={qrLabel} /> : <div className="aspect-square rounded-2xl bg-paper" />}
              </div>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 rounded-xl bg-paper p-1" role="group" aria-label="QR contents">
                  <ModeButton active={qrMode === "card"} onClick={() => setQrMode("card")}>
                    Open card
                  </ModeButton>
                  <ModeButton active={qrMode === "contact"} onClick={() => setQrMode("contact")}>
                    Save contact
                  </ModeButton>
                </div>
                <button
                  type="button"
                  onClick={saveContact}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-medium text-ink"
                >
                  <Download className="size-4" />
                  Download contact
                </button>
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-cream px-4 text-sm font-medium"
                >
                  {notice === "Link copied" ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {notice === "Link copied" ? "Link copied" : "Copy link"}
                </button>
                <button
                  type="button"
                  onClick={shareCard}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-cream px-4 text-sm font-medium"
                >
                  <Share2 className="size-4" />
                  Share
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-card border border-line bg-cream p-5 sm:p-6">
            <div className="flex items-end justify-between gap-3">
              <h2 className="font-display text-2xl leading-tight">Profile</h2>
              <button
                type="button"
                onClick={() => {
                  setProfile(DEFAULT_PROFILE);
                  setFocusDraft("");
                }}
                className="inline-flex h-10 items-center gap-1.5 text-sm text-mute"
              >
                <RotateCcw className="size-4" />
                Restore sample
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={profile.fullName} onChange={(value) => update("fullName", value)} autoComplete="name" />
              <Field label="Role" value={profile.role} onChange={(value) => update("role", value)} autoComplete="organization-title" />
              <Field
                label="Organization"
                value={profile.organization}
                onChange={(value) => update("organization", value)}
                autoComplete="organization"
              />
              <Field label="Location" value={profile.location} onChange={(value) => update("location", value)} autoComplete="address-level2" />
              <Field label="Email" value={profile.email} onChange={(value) => update("email", value)} type="email" autoComplete="email" />
              <Field label="Phone" value={profile.phone} onChange={(value) => update("phone", value)} type="tel" autoComplete="tel" />
              <Field label="Website" value={profile.website} onChange={(value) => update("website", value)} type="url" autoComplete="url" />
              <Field label="GitHub" value={profile.github} onChange={(value) => update("github", value)} autoComplete="username" />
            </div>

            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-xs font-medium tracking-wide text-mute uppercase">Tagline</span>
              <input
                value={profile.tagline}
                maxLength={160}
                onChange={(event) => update("tagline", event.target.value)}
                className="h-11 rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </label>

            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-xs font-medium tracking-wide text-mute uppercase">Note</span>
              <textarea
                value={profile.note}
                maxLength={280}
                rows={3}
                onChange={(event) => update("note", event.target.value)}
                className="resize-none rounded-xl border border-line bg-paper px-3 py-3 text-sm leading-relaxed text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </label>

            <div className="mt-5">
              <p className="text-xs font-medium tracking-wide text-mute uppercase">Focus</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.focus.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => update("focus", profile.focus.filter((item) => item !== tag))}
                    className="inline-flex h-9 items-center gap-1 rounded-full border border-line bg-paper px-3 text-sm"
                  >
                    {tag}
                    <X className="size-3.5" />
                    <span className="sr-only">Remove {tag}</span>
                  </button>
                ))}
              </div>
              <form
                className="mt-3 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  addFocus();
                }}
              >
                <input
                  value={focusDraft}
                  maxLength={24}
                  onChange={(event) => setFocusDraft(event.target.value)}
                  placeholder={profile.focus.length >= 6 ? "Six is enough" : "Add a focus"}
                  disabled={profile.focus.length >= 6}
                  className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={profile.focus.length >= 6 || !focusDraft.trim()}
                  className="h-11 rounded-xl bg-ink px-4 text-sm font-medium text-cream disabled:opacity-40"
                >
                  Add
                </button>
              </form>
            </div>

            <div className="mt-5">
              <p className="text-xs font-medium tracking-wide text-mute uppercase">Ink</p>
              <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Card ink">
                {THEMES.map((theme) => {
                  const selected = profile.theme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => update("theme", theme.id as ThemeId)}
                      className={
                        "inline-flex h-11 items-center gap-2 rounded-full border px-3 text-sm " +
                        (selected ? "border-ink bg-paper" : "border-line bg-cream")
                      }
                    >
                      <span className={`size-4 rounded-full ${swatchClass(theme.id)}`} aria-hidden="true" />
                      {theme.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function swatchClass(theme: ThemeId): string {
  if (theme === "signal") return "bg-swatch-signal";
  if (theme === "tide") return "bg-swatch-tide";
  if (theme === "ink") return "bg-swatch-ink";
  return "bg-swatch-brass";
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        "h-10 rounded-lg text-sm font-medium " + (active ? "bg-ink text-cream" : "text-mute")
      }
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-xs font-medium tracking-wide text-mute uppercase">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        maxLength={type === "email" ? 120 : 80}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
    </label>
  );
}
