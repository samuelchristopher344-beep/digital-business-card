import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check,
  Copy,
  Download,
  Image,
  Flag,
  Mail,
  MessageCircle,
  Share2,
  Smartphone,
  X,
} from "lucide-react";
import { CallingCard } from "@/components/calling-card";
import { QrMark } from "@/components/qr-mark";
import { PrivacyNote } from "@/components/privacy-note";
import { recordShare, recordView } from "@/lib/card-analytics";
import { downloadVCard, SAVE_PHONE_HELP, shareVCardToPhone } from "@/lib/save-contact";
import { downloadCardImage, shareCardImage, tryNativeShareLink } from "@/lib/share-image";
import {
  blockKey,
  isBlocked,
  submitReport,
  upsertPrivateContact,
  CONTACT_TAGS,
  type ContactTagId,
} from "@/lib/privacy-vault";
import {
  DEMO_PROFILE,
  publicCardUrl,
  readHashProfile,
  readStoredProfile,
  toMeCard,
  type Profile,
} from "@/lib/profile";

export const Route = createFileRoute("/u/$slug")({ component: PublicCardPage });

function PublicCardPage() {
  const { slug } = Route.useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrMode, setQrMode] = useState<"card" | "contact">("card");
  const [notice, setNotice] = useState("");
  const [link, setLink] = useState("");
  const [showSavePrivate, setShowSavePrivate] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      // Prefer #c= payload when present so a freshly shared link always shows
      // the version the owner just copied — not a stale server snapshot.
      const fromHash = readHashProfile();
      if (fromHash) {
        if (!cancelled) {
          const withSlug = {
            ...fromHash,
            username: fromHash.username || slug,
          };
          setProfile(withSlug);
          if (typeof window !== "undefined") {
            setLink(publicCardUrl(withSlug));
          }
          setLoading(false);
        }
        return;
      }

      if (slug !== "demo") {
        try {
          const res = await fetch(`/api/cards/${encodeURIComponent(slug)}`);
          if (res.ok) {
            const data = (await res.json()) as { card: Profile };
            if (!cancelled && data.card) {
              setProfile(data.card);
              if (typeof window !== "undefined") {
                setLink(publicCardUrl({ ...data.card, username: data.card.username || slug }));
              }
              setLoading(false);
              return;
            }
          }
        } catch {
          // fall through
        }
      }

      const stored = readStoredProfile();
      let next: Profile | null = null;

      if (slug === "demo") {
        next = DEMO_PROFILE;
      } else if (stored && (stored.username === slug || !stored.username)) {
        next = { ...stored, username: stored.username || slug };
      }

      if (!cancelled) {
        setProfile(next);
        if (next && typeof window !== "undefined") {
          setLink(publicCardUrl({ ...next, username: next.username || slug }));
        }
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (profile) recordView(slug);
  }, [profile, slug]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
        Loading…
      </main>
    );
  }

  if (profile === null) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold">Card not found</h1>
        <p className="text-sm text-zinc-600">
          No profile is attached to <code className="rounded bg-zinc-100 px-1">/u/{slug}</code>.
        </p>
        <Link
          to="/create"
          className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white"
        >
          Create your card
        </Link>
      </main>
    );
  }

  if (isBlocked(slug)) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold">Blocked</h1>
        <p className="text-sm text-zinc-600">
          You blocked this card on this device. Unblock anytime in Security.
        </p>
        <PrivacyNote variant="block" />
        <Link to="/security" className="text-sm font-medium underline-offset-2 hover:underline">
          Open security
        </Link>
      </main>
    );
  }

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    recordShare(slug);
    setNotice("Link copied");
  }

  async function shareCard() {
    const shareText =
      [profile!.fullName, profile!.role || profile!.tagline].filter(Boolean).join(" — ") ||
      "Calling card";
    const r = await tryNativeShareLink({
      title: profile!.fullName || "Calling Card",
      text: shareText,
      url: link,
    });
    if (r === "shared") {
      recordShare(slug);
      return;
    }
    if (r === "aborted") return;
    setShowShareSheet(true);
  }

  function saveContactFile() {
    downloadVCard(profile!, slug);
    setNotice("Contact file downloaded — open it to add to Apple or Google Contacts");
  }

  async function saveOnPhone() {
    const result = await shareVCardToPhone(profile!, slug);
    if (result === "shared") setNotice("Shared to your phone — add to Contacts");
    else if (result === "downloaded") setNotice("Contact file saved on this device");
  }

  const qrValue = qrMode === "contact" ? toMeCard(profile) : link;
  const shareText =
    [profile.fullName, profile.role || profile.tagline].filter(Boolean).join(" — ") ||
    "Calling card";

  return (
    <main data-theme={profile.theme} className="min-h-screen text-ink">
      <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-5 lg:items-start lg:gap-8 lg:py-12">
        <div className="lg:sticky lg:top-8 lg:col-span-2">
          <header className="mb-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium tracking-widest text-mute uppercase">
                @{profile.username || slug}
              </p>
              <Link to="/" className="text-xs text-mute underline-offset-2 hover:underline">
                Get your own
              </Link>
            </div>
          </header>
          <CallingCard profile={profile} />
        </div>

        <div className="flex min-w-0 flex-col gap-6 lg:col-span-3">
          <section className="rounded-card border border-line bg-cream p-5 sm:p-6">
            <h2 className="font-display text-2xl leading-tight">Connect</h2>
            <p className="mt-1 text-sm leading-relaxed text-mute">
              Scan the QR, save to your phone, or share this page.
            </p>

            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="sm:w-52 sm:shrink-0">
                {qrValue ? (
                  <QrMark
                    value={qrValue}
                    label={
                      qrMode === "contact"
                        ? "QR code that saves this contact"
                        : "QR code that opens this card"
                    }
                  />
                ) : (
                  <div className="aspect-square rounded-2xl bg-paper" />
                )}
              </div>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 rounded-xl bg-paper p-1">
                  <button
                    type="button"
                    aria-pressed={qrMode === "card"}
                    onClick={() => setQrMode("card")}
                    className={
                      "h-10 rounded-lg text-sm font-medium " +
                      (qrMode === "card" ? "bg-ink text-cream" : "text-mute")
                    }
                  >
                    Open card
                  </button>
                  <button
                    type="button"
                    aria-pressed={qrMode === "contact"}
                    onClick={() => setQrMode("contact")}
                    className={
                      "h-10 rounded-lg text-sm font-medium " +
                      (qrMode === "contact" ? "bg-ink text-cream" : "text-mute")
                    }
                  >
                    Save contact
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={saveOnPhone}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-3 text-sm font-medium text-cream"
                  >
                    <Smartphone className="size-4" /> Save on phone
                  </button>
                  <button
                    type="button"
                    onClick={saveContactFile}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-paper px-3 text-sm font-medium"
                  >
                    <Download className="size-4" /> Download .vcf
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await downloadCardImage(profile!);
                        setNotice("Card image saved — check Downloads or Gallery");
                      } catch {
                        setNotice("Could not save image");
                      }
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-paper px-3 text-sm font-medium"
                  >
                    <Image className="size-4" /> Download card image
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const r = await shareCardImage(profile!);
                        if (r === "shared") setNotice("Image shared — perfect for WhatsApp");
                        else if (r === "aborted") return;
                        else {
                          await downloadCardImage(profile!);
                          setNotice("Image saved — attach it in WhatsApp");
                        }
                      } catch {
                        setNotice("Could not share image");
                      }
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-paper px-3 text-sm font-medium"
                  >
                    <Share2 className="size-4" /> Share as image
                  </button>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-paper px-3 text-sm font-medium"
                  >
                    <Copy className="size-4" /> Copy link
                  </button>
                  <button
                    type="button"
                    onClick={shareCard}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-paper px-3 text-sm font-medium"
                  >
                    <Share2 className="size-4" /> Share
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-mute">{SAVE_PHONE_HELP.both}</p>
                <p className="text-xs text-mute">{SAVE_PHONE_HELP.apple}</p>
                <p className="text-xs text-mute">{SAVE_PHONE_HELP.google}</p>
                {notice ? (
                  <p className="inline-flex items-center gap-1.5 text-sm text-mute">
                    <Check className="size-4 text-accent" /> {notice}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-card border border-line bg-cream p-5">
            <h3 className="text-sm font-semibold">Your private notebook</h3>
            <PrivacyNote className="mt-3" />
            <button
              type="button"
              onClick={() => setShowSavePrivate(true)}
              className="mt-3 h-10 rounded-xl border border-line bg-paper px-4 text-sm font-medium"
            >
              Save to my contacts with tag + note
            </button>
            <p className="mt-2 text-xs text-mute">
              Only you see tags and notes. The other person is not notified.
            </p>
          </section>

          <section className="flex flex-wrap gap-3 text-xs text-mute">
            <button
              type="button"
              className="underline-offset-2 hover:underline"
              onClick={() => {
                blockKey(slug, profile.fullName || slug, "Blocked from public card");
                setNotice("Blocked on this device");
              }}
            >
              Block on this device
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
              onClick={() => setShowReport(true)}
            >
              <Flag className="size-3" /> Report
            </button>
            <Link to="/privacy" className="underline-offset-2 hover:underline">
              Privacy
            </Link>
          </section>

          <p className="text-center text-sm text-mute">
            Want a card like this?{" "}
            <Link to="/create" className="font-medium text-ink underline-offset-2 hover:underline">
              Create yours free
            </Link>
          </p>
        </div>
      </div>

      {showSavePrivate ? (
        <PrivateSaveModal
          profile={profile}
          slug={slug}
          link={link}
          onClose={() => setShowSavePrivate(false)}
          onSaved={() => {
            setShowSavePrivate(false);
            setNotice("Saved privately — only you can see it");
          }}
        />
      ) : null}

      {showReport ? (
        <ReportModal
          slug={slug}
          onClose={() => setShowReport(false)}
          onDone={() => {
            setShowReport(false);
            setNotice("Report recorded. Thank you.");
          }}
        />
      ) : null}

      {showShareSheet ? (
        <PublicShareSheet
          url={link}
          shareText={shareText}
          title={profile.fullName || "Calling Card"}
          onClose={() => setShowShareSheet(false)}
          onCopied={() => {
            recordShare(slug);
            setNotice("Link copied");
            setShowShareSheet(false);
          }}
          onShared={() => recordShare(slug)}
        />
      ) : null}
    </main>
  );
}
