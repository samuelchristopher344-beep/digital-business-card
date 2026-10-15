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
  CARD_TYPES,
  EMPTY_PROFILE,
  THEMES,
  formatPhoneDisplay,
  getFullPhone,
  publicCardUrl,
  slugify,
  toMeCard,
  writeHash,
  writeStoredProfile,
  type CardTypeId,
  type Profile,
  type ThemeId,
} from "@/lib/profile";
import {
  SHOWCASE_MAX,
  SHOWCASE_STYLES,
  SHOWCASE_TEXT_MAX,
  createShowcaseId,
  showcaseImageUrl,
  suggestStyleFromText,
  type ShowcaseStyleId,
} from "@/lib/showcase";

const COUNTRY_CODES = [
  { code: "+1", label: "US +1" },
  { code: "+44", label: "UK +44" },
  { code: "+234", label: "NG +234" },
  { code: "+91", label: "IN +91" },
  { code: "+86", label: "CN +86" },
  { code: "+49", label: "DE +49" },
  { code: "+33", label: "FR +33" },
  { code: "+81", label: "JP +81" },
  { code: "+55", label: "BR +55" },
  { code: "+27", label: "ZA +27" },
  { code: "+61", label: "AU +61" },
  { code: "+7", label: "RU +7" },
];

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
  const [showcaseDraft, setShowcaseDraft] = useState("");
  const [showcaseStyle, setShowcaseStyle] = useState<ShowcaseStyleId>("auto");
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
  const [localPhone, setLocalPhone] = useState("");

  useEffect(() => {
    ensureCardStore();
    setProfile(initial);
    writeStoredProfile(initial);
    if (typeof window !== "undefined") {
      writeHash(initial);
      setLink(publicCardUrl(initial));
    }
    const full = getFullPhone(initial);
    if (full.startsWith(initial.phoneCountry || "+1")) {
      setLocalPhone(full.slice((initial.phoneCountry || "+1").length));
    } else {
      setLocalPhone(initial.phone.replace(/^\+\d+/, ""));
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

  function updatePhone(country: string, local: string) {
    const cleanedLocal = local.replace(/[^\d]/g, "");
    const full = cleanedLocal ? `${country}${cleanedLocal}` : "";
    setProfile((current) => ({ ...current, phoneCountry: country, phone: full }));
    setLocalPhone(cleanedLocal);
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

  function addShowcase() {
    const next = showcaseDraft.trim().slice(0, SHOWCASE_TEXT_MAX);
    const list = profile.showcase ?? [];
    if (!next || list.length >= SHOWCASE_MAX) return;
    if (list.some((item) => item.text.toLowerCase() === next.toLowerCase())) {
      setShowcaseDraft("");
      return;
    }
    const style = showcaseStyle === "auto" ? suggestStyleFromText(next) : showcaseStyle;
    update("showcase", [...list, { id: createShowcaseId(), text: next, style }]);
    setShowcaseDraft("");
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
  const fullPhoneDisplay = formatPhoneDisplay(profile);
  const type = profile.cardType || "personal";
  const showRole = type === "business" || type === "company" || type === "org" || type === "creator";
  const showOrg = type === "business" || type === "company" || type === "org";
  const showPhone = true;
  const phoneRequired = type === "personal";
  const showFocus = type === "personal" || type === "creator" || type === "business";
  const showSocials = type === "personal" || type === "creator" || type === "business";

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
                  <Link to="/cards" className="underline-offset-2 hover:underline">Cards</Link>
                  <Link to="/" className="underline-offset-2 hover:underline">Home</Link>
                </div>
              </div>
              <h1 className="mt-2 font-display text-2xl leading-tight">{heading}</h1>
              <p className="mt-2 text-sm leading-relaxed text-mute">{subheading}</p>
              {showPublicLink && publicSlug ? (
                <p className="mt-2 text-sm">
                  <Link to="/u/$slug" params={{ slug: publicSlug }} className="font-medium text-accent underline-offset-2 hover:underline">
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
                    <p className="mt-0.5 text-xs text-mute">Optional sync so this card works on another device after sign-in.</p>
                  </div>
                  <button type="button" disabled={saving} onClick={saveToAccount} className="h-10 rounded-xl bg-ink px-4 text-sm font-medium text-cream disabled:opacity-60">
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
              <p className="mt-1 text-sm leading-relaxed text-mute">Save to phone, share an image for WhatsApp, or scan the QR.</p>
              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="sm:w-52 sm:shrink-0">
                  {qrValue ? <QrMark value={qrValue} label={qrLabel} /> : <div className="aspect-square rounded-2xl bg-paper" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="grid grid-cols-2 rounded-xl bg-paper p-1" role="group" aria-label="QR contents">
                    <ModeButton active={qrMode === "card"} onClick={() => setQrMode("card")}>Open card</ModeButton>
                    <ModeButton active={qrMode === "contact"} onClick={() => setQrMode("contact")}>Save contact</ModeButton>
                  </div>
                  <ShareActions profile={profile} cardKey={publicSlug || "my-card"} />
                </div>
              </div>
            </section>

            <section className="rounded-card border border-line bg-cream p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl leading-tight">Profile</h2>
                <button type="button" onClick={() => { setProfile({ ...EMPTY_PROFILE }); setLocalPhone(""); }} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm text-mute hover:text-ink">
                  <RotateCcw className="size-3.5" aria-hidden="true" /> Clear
                </button>
              </div>

              <div className="mt-5">
                <span className="text-xs font-medium tracking-wide text-mute uppercase">Card type</span>
                <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Card type">
                  {CARD_TYPES.map((t) => {
                    const selected = profile.cardType === t.id;
                    return (
                      <button key={t.id} type="button" role="radio" aria-checked={selected} onClick={() => update("cardType", t.id as CardTypeId)} title={t.blurb}
                        className={"inline-flex h-10 items-center rounded-full border px-3 text-sm " + (selected ? "border-ink bg-paper font-medium" : "border-line bg-cream text-mute")}>
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label={type === "company" || type === "org" ? "Contact name" : "Full name"} value={profile.fullName} onChange={(v) => update("fullName", v)} autoComplete="name" />
                <Field label="Username" value={profile.username} onChange={(v) => update("username", slugify(v))} autoComplete="username" />
                {showRole ? <Field label={type === "company" || type === "org" ? "Your role" : "Role / title"} value={profile.role} onChange={(v) => update("role", v)} /> : null}
                {showOrg ? <Field label={type === "company" ? "Company name" : type === "org" ? "Organization" : "Company / org"} value={profile.organization} onChange={(v) => update("organization", v)} /> : null}
                <Field label="Tagline" value={profile.tagline} onChange={(v) => update("tagline", v)} />
                <Field label="Email" value={profile.email} onChange={(v) => update("email", v)} type="email" autoComplete="email" />
                {showPhone ? (
                  <div className="sm:col-span-2">
                    <span className="text-xs font-medium tracking-wide text-mute uppercase">Phone {phoneRequired ? "(recommended)" : ""}</span>
                    <div className="mt-1.5 flex gap-2">
                      <select value={profile.phoneCountry || "+1"} onChange={(e) => updatePhone(e.target.value, localPhone)} className="h-11 rounded-xl border border-line bg-paper px-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label="Country code">
                        {COUNTRY_CODES.map((c) => (<option key={c.code} value={c.code}>{c.label}</option>))}
                      </select>
                      <input type="tel" value={localPhone} onChange={(e) => updatePhone(profile.phoneCountry || "+1", e.target.value)} placeholder="Local number" autoComplete="tel-national" className="h-11 flex-1 rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent" />
                    </div>
                    {fullPhoneDisplay ? <p className="mt-1 text-xs text-mute">Stored as {getFullPhone(profile)}</p> : null}
                  </div>
                ) : null}
                <Field label="Website" value={profile.website} onChange={(v) => update("website", v)} />
                <Field label="Location" value={profile.location} onChange={(v) => update("location", v)} />
                {showSocials ? (
                  <>
                    <Field label="WhatsApp" value={profile.whatsapp} onChange={(v) => update("whatsapp", v)} placeholder="Number or +234..." />
                    <Field label="Telegram" value={profile.telegram} onChange={(v) => update("telegram", v)} placeholder="@username or link" />
                    <Field label="LinkedIn" value={profile.linkedin} onChange={(v) => update("linkedin", v)} placeholder="username or full URL" />
                    <Field label="Instagram" value={profile.instagram} onChange={(v) => update("instagram", v)} placeholder="@username or link" />
                    <Field label="X (Twitter)" value={profile.x} onChange={(v) => update("x", v)} placeholder="@username or link" />
                  </>
                ) : null}
              </div>

              <label className="mt-4 flex flex-col gap-1.5">
                <span className="text-xs font-medium tracking-wide text-mute uppercase">Note</span>
                <textarea value={profile.note} maxLength={280} rows={3} onChange={(event) => update("note", event.target.value)} className="rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent" />
              </label>

              {showFocus ? (
                <div className="mt-4">
                  <span className="text-xs font-medium tracking-wide text-mute uppercase">Focus tags</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.focus.map((tag) => (
                      <button key={tag} type="button" onClick={() => update("focus", profile.focus.filter((item) => item !== tag))} className="inline-flex h-9 items-center gap-1 rounded-full border border-line bg-paper px-3 text-sm">
                        {tag}<X className="size-3.5 text-mute" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input value={focusDraft} maxLength={24} placeholder="Add a tag" onChange={(event) => setFocusDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addFocus(); } }} className="h-11 flex-1 rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent" />
                    <button type="button" onClick={addFocus} className="h-11 rounded-xl bg-ink px-4 text-sm font-medium text-cream">Add</button>
                  </div>
                </div>
              ) : null}

              <div className="mt-5">
                <span className="text-xs font-medium tracking-wide text-mute uppercase">Showcase</span>
                <p className="mt-1 text-xs leading-relaxed text-mute">Describe what you do or offer. We generate gallery images from your words.</p>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {(profile.showcase ?? []).map((item) => {
                    const src = showcaseImageUrl(item.text, profile.cardType, item.style ?? "auto");
                    return (
                      <div key={item.id} className="w-28 shrink-0">
                        <div className="relative overflow-hidden rounded-xl border border-line bg-paper">
                          {src ? <img src={src} alt="" className="aspect-[3/4] w-full object-cover" loading="lazy" /> : <div className="aspect-[3/4] w-full bg-line/40" />}
                          <button type="button" onClick={() => update("showcase", (profile.showcase ?? []).filter((s) => s.id !== item.id))} className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white" aria-label={`Remove ${item.text}`}>
                            <X className="size-3.5" />
                          </button>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[11px] text-mute">{item.text}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Image type">
                  {SHOWCASE_STYLES.map((s) => (
                    <button key={s.id} type="button" role="radio" aria-checked={showcaseStyle === s.id} title={s.hint} onClick={() => setShowcaseStyle(s.id)}
                      className={"inline-flex h-8 items-center rounded-full border px-2.5 text-xs " + (showcaseStyle === s.id ? "border-ink bg-paper font-medium text-ink" : "border-line bg-cream text-mute")}>
                      {s.label}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input value={showcaseDraft} maxLength={SHOWCASE_TEXT_MAX} placeholder="e.g. Green lace owambe dress" onChange={(event) => setShowcaseDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addShowcase(); } }} className="h-11 flex-1 rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent" />
                  <button type="button" onClick={addShowcase} disabled={(profile.showcase ?? []).length >= SHOWCASE_MAX} className="h-11 rounded-xl bg-ink px-4 text-sm font-medium text-cream disabled:opacity-50">Add look</button>
                </div>
                <p className="mt-1.5 text-[11px] text-mute">
                  {(profile.showcase ?? []).length}/{SHOWCASE_MAX} · From your words{showcaseStyle !== "auto" ? ` · ${showcaseStyle}` : " · Auto style"}
                </p>
              </div>

              <div className="mt-5">
                <span className="text-xs font-medium tracking-wide text-mute uppercase">Ink</span>
                <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Card ink">
                  {THEMES.map((theme) => {
                    const selected = profile.theme === theme.id;
                    return (
                      <button key={theme.id} type="button" role="radio" aria-checked={selected} onClick={() => update("theme", theme.id as ThemeId)}
                        className={"inline-flex h-11 items-center gap-2 rounded-full border px-3 text-sm " + (selected ? "border-ink bg-paper" : "border-line bg-cream")}>
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
    <button type="button" aria-pressed={active} onClick={onClick} className={"h-10 rounded-lg text-sm font-medium " + (active ? "bg-ink text-cream" : "text-mute")}>
      {children}
    </button>
  );
}

function Field({ label, value, onChange, type = "text", autoComplete, placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string; placeholder?: string }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-xs font-medium tracking-wide text-mute uppercase">{label}</span>
      <input id={id} type={type} value={value} autoComplete={autoComplete} placeholder={placeholder} maxLength={type === "email" ? 120 : 80} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent" />
    </label>
  );
}
