import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy, Download, Share2 } from "lucide-react";
import { CallingCard } from "@/components/calling-card";
import { QrMark } from "@/components/qr-mark";
import {
  DEMO_PROFILE,
  downloadFileName,
  publicCardUrl,
  readHashProfile,
  readStoredProfile,
  toMeCard,
  toVCard,
  type Profile,
} from "@/lib/profile";

export const Route = createFileRoute("/u/$slug")({ component: PublicCardPage });

function PublicCardPage() {
  const { slug } = Route.useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [qrMode, setQrMode] = useState<"card" | "contact">("card");
  const [notice, setNotice] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    const fromHash = readHashProfile();
    const stored = readStoredProfile();
    let next: Profile | null = null;

    if (fromHash) {
      next = fromHash;
    } else if (slug === "demo") {
      next = DEMO_PROFILE;
    } else if (stored && (stored.username === slug || !stored.username)) {
      next = { ...stored, username: stored.username || slug };
    }

    setProfile(next);
    if (next && typeof window !== "undefined") {
      setLink(publicCardUrl({ ...next, username: next.username || slug }));
    }
  }, [slug]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  if (profile === null) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold">Card not found</h1>
        <p className="text-sm text-zinc-600">
          No profile is attached to <code className="rounded bg-zinc-100 px-1">/u/{slug}</code>.
          Create your own card and share the full link (it includes your details).
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

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    setNotice("Link copied");
  }

  async function shareCard() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile!.fullName || "Calling Card",
          text: profile!.role || profile!.tagline,
          url: link,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(link);
    setNotice("Link copied");
  }

  function saveContact() {
    const blob = new Blob([toVCard(profile!)], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = downloadFileName(profile!);
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Contact file saved");
  }

  const qrValue = qrMode === "contact" ? toMeCard(profile) : link;

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
              Scan the QR, save the contact, or share this page.
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
                    onClick={saveContact}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-paper px-3 text-sm font-medium"
                  >
                    <Download className="size-4" /> Download contact
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
                {notice ? (
                  <p className="inline-flex items-center gap-1.5 text-sm text-mute">
                    <Check className="size-4 text-accent" /> {notice}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <p className="text-center text-sm text-mute">
            Want a card like this?{" "}
            <Link to="/create" className="font-medium text-ink underline-offset-2 hover:underline">
              Create yours free
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
