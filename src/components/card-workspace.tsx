import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { RotateCcw, X } from "lucide-react";
import { AccountBar } from "@/components/account-bar";
import { CallingCard } from "@/components/calling-card";
import { QrMark } from "@/components/qr-mark";
import { ShareActions } from "@/components/share-actions";
import { useSession } from "@/lib/auth/client";
import { ensureCardStore, saveActiveProfile } from "@/lib/multi-card";
import {
  EMPTY_PROFILE,
  THEMES,
  publicCardUrl,
  slugify,
  toMeCard,
  writeHash,
  writeStoredProfile,
  type Profile,
  type ThemeId,
} from "@/lib/profile";

type Props = {
  initial: Profile;
  showPublicLink?: boolean;
  heading?: string;
  subheading?: string;
};

export function CardWorkspace({
  initial,
  showPublicLink = true,
  heading = "Your card",
  subheading = "Edit freely. Your link and QR update as you type.",
}: Props) {
  const { data: session } = useSession();
  const signedIn = Boolean(session?.user);
  const [profile, setProfile] = useState<Profile>(initial);
  const [booted, setBooted] = useState(false);
  const [qrMode, setQrMode] = useState<"card" | "contact">("card");
  const [focusDraft, setFocusDraft] = useState("");
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    ensureCardStore();
    setProfile(initial);
    writeStoredProfile(initial);
    if (typeof window !== "undefined") {
      writeHash(initial);
      setLink(publicCardUrl(initial));
    }
    setBooted(true);
  }, [initial]);

  useEffect(() => {
    if (!booted) return;
    const next =
      profile.username || !profile.fullName
        ? profile
        : { ...profile, username: slugify(profile.fullName) };
    if (next.username !== profile.username) {
      setProfile(next);
      return;
    }
    writeStoredProfile(profile);
    saveActiveProfile(profile);
    writeHash(profile);
    setLink(publicCardUrl(profile));
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

  async function saveToAccount() {
    if (!signedIn) return;
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/cards/me", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(profile),
        credentials: "include",
      });
      const data = (await res.json()) as { card?: Profile; error?: string };
      if (!res.ok) {
        setSaveError(data.error || "Could not save");
        return;
      }
      if (data.card) {
        setProfile(data.card);
        writeStoredProfile(data.card);
        saveActiveProfile(data.card);
      }
      setNotice("Saved to your account");
    } catch {
      setSaveError("Network error — try again");
    } finally {
      setSaving(false);
    }
  }

  const qrValue = qrMode === "contact" ? toMeCard(profile) : link;
  const qrLabel =
    qrMode === "contact"
      ? "QR code that saves this person as a contact"
      : "QR code that opens this calling card";
  const publicSlug = slugify(profile.username || profile.fullName);

  return (
    <div className="min-h-screen">
      <AccountBar />
      <main data-theme={profile.theme} className="min-h-screen text-ink">
        <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-5 lg:items-start lg:gap-8 lg:py-12">
          <div className="lg:sticky lg:top-8 lg:col-span-2">
            <header className="mb-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium tracking-widest text-mute uppercase">Calling card</p>
                <div className="flex gap-3 text-xs text-mute">
                  <Link to="/cards" className="underline-offset-2 hover:underline">
                    Cards
                  </Link>
                  <Link to="/" className="underline-offset-2 hover:underline">
                    Home
                  </Link>
                </div>
              </div>
              <h1 className="mt-2 font-display text-2xl leading-tight">{heading}</h1>
              <p className="mt-2 text-sm leading-relaxed text-mute">{subheading}</p>
              {showPublicLink && publicSlug ? (
                <p className="mt-2 text-sm">
                  <Link
                    to="/u/$slug"
                    params={{ slug: publicSlug }}
                    className="font-medium text-accent underline-offset-2 hover:underline"
                  >
                    Open public page →
                  </Link>
                </p>
              ) : null}
            </header>
            <CallingCard profile={profile} />
          </div>

          <div className="flex min-w-0 flex-col gap-6 lg:col-span-3">
            {signedIn ? (
              <section className="rounded-card border border-line bg-cream p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink">Save to your account</p>
                    <p className="mt-0.5 text-xs text-mute">
                      Optional sync so this card works on another device after sign-in.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={saveToAccount}
                    className="h-10 rounded-xl bg-ink px-4 text-sm font-medium text-cream disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save to account"}
                  </button>
                </div>
                {saveError ? <p className="mt-2 text-sm text-red-700">{saveError}</p> : null}
                {notice ? <p className="mt-2 text-sm text-mute">{notice}</p> : null}
              </section>
            ) : (
              <section className="rounded-card border border-line bg-cream p-4 text-sm text-mute">
                Account is optional. This card already works in this browser.{" "}
                <Link to="/signup" className="font-medium text-ink underline-offset-2 hover:underline">
                  Sign up only if you want the same card on another device
                </Link>
                .
              </section>
            )}

            <section className="rounded-card border border-line bg-cream p-5 sm:p-6">
              <h2 className="font-display text-2xl leading-tight">Hand it over</h2>
              <p className="mt-1 text-sm leading-relaxed text-mute">
                Save to phone, share an image for WhatsApp, or scan the QR.
              </p>

              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="sm:w-52 sm:shrink-0">
                  {qrValue ? (
                    <QrMark value={qrValue} label={qrLabel} />
                  ) : (
                    <div className="aspect-square rounded-2xl bg-paper" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="grid grid-cols-2 rounded-xl bg-paper p-1" role="group" aria-label="QR contents">
                    <ModeButton active={qrMode === "card"} onClick={() => setQrMode("card")}>
                      Open card
                    </ModeButton>
                    <ModeButton active={qrMode === "contact"} onClick={() => setQrMode("contact")}>
                      Save contact
                    </ModeButton>
                  </div>
                  <ShareActions profile={profile} cardKey={publicSlug || "my-card"} />
                </div>
              </div>
            </section>

            <section className="rounded-card border border-line bg-cream p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl leading-tight">Profile</h2>
                <button
                  type="button"
                  onClick={() => setProfile({ ...EMPTY_PROFILE })}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm text-mute hover:text-ink"
                >
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                  Clear
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Full name" value={profile.fullName} onChange={(v) => update("fullName", v)} autoComplete="name" />
                <Field label="Username" value={profile.username} onChange={(v) => update("username", slugify(v))} autoComplete="username" />
                <Field label="Role / title" value={profile.role} onChange={(v) => update("role", v)} />
                <Field label="Organization" value={profile.organization} onChange={(v) => update("organization", v)} />
                <Field label="Tagline" value={profile.tagline} onChange={(v) => update("tagline", v)} />
                <Field label="Email" value={profile.email} onChange={(v) => update("email", v)} type="email" autoComplete="email" />
                <Field label="Phone" value={profile.phone} onChange={(v) => update("phone", v)} type="tel" autoComplete="tel" />
                <Field label="Website" value={profile.website} onChange={(v) => update("website", v)} />
                <Field label="Location" value={profile.location} onChange={(v) => update("location", v)} />
                <Field label="GitHub" value={profile.github} onChange={(v) => update("github", v)} />
              </div>

              <label className="mt-4 flex flex-col gap-1.5">
                <span className="text-xs font-medium tracking-wide text-mute uppercase">Note</span>
                <textarea
                  value={profile.note}
                  maxLength={280}
                  rows={3}
                  onChange={(event) => update("note", event.target.value)}
                  className="rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </label>

              <div className="mt-4">
                <span className="text-xs font-medium tracking-wide text-mute uppercase">Focus tags</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.focus.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => update("focus", profile.focus.filter((item) => item !== tag))}
                      className="inline-flex h-9 items-center gap-1 rounded-full border border-line bg-paper px-3 text-sm"
                    >
                      {tag}
                      <X className="size-3.5 text-mute" aria-hidden="true" />
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    value={focusDraft}
                    maxLength={24}
                    placeholder="Add a tag"
                    onChange={(event) => setFocusDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addFocus();
                      }
                    }}
                    className="h-11 flex-1 rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                  <button type="button" onClick={addFocus} className="h-11 rounded-xl bg-ink px-4 text-sm font-medium text-cream">
                    Add
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <span className="text-xs font-medium tracking-wide text-mute uppercase">Ink</span>
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
    </div>
  );
}

function swatchClass(theme: ThemeId): string {
  if (theme === "signal") return "bg-swatch-signal";
  if (theme === "tide") return "bg-swatch-tide";
  if (theme === "ink") return "bg-swatch-ink";
  return "bg-swatch-brass";
}

function ModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={"h-10 rounded-lg text-sm font-medium " + (active ? "bg-ink text-cream" : "text-mute")}
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
