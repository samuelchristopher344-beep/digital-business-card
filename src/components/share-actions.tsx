import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Download,
  Image,
  Mail,
  MessageCircle,
  Smartphone,
  Share2,
  X,
} from "lucide-react";
import { copyEmailSignature } from "@/lib/email-signature";
import { homeScreenInstructions } from "@/lib/home-screen";
import { publicCardUrl, type Profile } from "@/lib/profile";
import { downloadVCard, shareVCardToPhone } from "@/lib/save-contact";
import {
  downloadCardImage,
  shareCardImage,
  tryNativeShareLink,
} from "@/lib/share-image";

type SheetMode = "link" | "image" | null;

export function ShareActions({ profile, cardKey }: { profile: Profile; cardKey?: string }) {
  const [notice, setNotice] = useState("");
  const [sheet, setSheet] = useState<SheetMode>(null);
  const [busy, setBusy] = useState(false);

  function flash(msg: string) {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 2800);
  }

  const url = publicCardUrl(profile);
  const shareText =
    [profile.fullName, profile.role || profile.tagline].filter(Boolean).join(" — ") ||
    "My calling card";

  async function onShareImage() {
    setBusy(true);
    try {
      const r = await shareCardImage(profile);
      if (r === "shared") {
        flash("Image shared — perfect for WhatsApp");
        return;
      }
      if (r === "aborted") return;
      // Native sheet unavailable (desktop / limited browsers) → custom sheet
      setSheet("image");
    } catch {
      flash("Could not create image");
    } finally {
      setBusy(false);
    }
  }

  async function onShareLink() {
    const r = await tryNativeShareLink({
      title: profile.fullName || "Calling Card",
      text: shareText,
      url,
    });
    if (r === "shared") return;
    if (r === "aborted") return;
    setSheet("link");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Btn
          icon={<Smartphone className="size-4" />}
          primary
          onClick={async () => {
            const r = await shareVCardToPhone(profile, cardKey);
            if (r === "shared") flash("Shared to phone — add to Contacts");
            else if (r === "downloaded") flash("Contact file downloaded (.vcf)");
          }}
        >
          Save on phone
        </Btn>
        <Btn icon={<Image className="size-4" />} onClick={onShareImage} disabled={busy}>
          {busy ? "Preparing…" : "Share as image"}
        </Btn>
        <Btn
          icon={<Download className="size-4" />}
          onClick={() => {
            downloadVCard(profile, cardKey);
            flash("Contact file (.vcf) ready");
          }}
        >
          Download .vcf
        </Btn>
        <Btn
          icon={<Copy className="size-4" />}
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            flash("Link copied");
          }}
        >
          Copy link
        </Btn>
        <Btn icon={<Share2 className="size-4" />} onClick={onShareLink}>
          Share link
        </Btn>
        <Btn
          icon={<Mail className="size-4" />}
          onClick={async () => {
            await copyEmailSignature(profile, true);
            flash("Email signature copied — paste into Gmail/Outlook");
          }}
        >
          Email signature
        </Btn>
      </div>
      <p className="text-xs leading-relaxed text-mute">{homeScreenInstructions()}</p>
      {notice ? (
        <p className="inline-flex items-center gap-1.5 text-sm text-mute">
          <Check className="size-4 text-accent" /> {notice}
        </p>
      ) : null}

      {sheet ? (
        <ShareSheet
          mode={sheet}
          profile={profile}
          url={url}
          shareText={shareText}
          onClose={() => setSheet(null)}
          onNotice={flash}
        />
      ) : null}
    </div>
  );
}

function ShareSheet({
  mode,
  profile,
  url,
  shareText,
  onClose,
  onNotice,
}: {
  mode: "link" | "image";
  profile: Profile;
  url: string;
  shareText: string;
  onClose: () => void;
  onNotice: (msg: string) => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${shareText}\n${url}`);
  const encodedTitle = encodeURIComponent(profile.fullName || "Calling Card");

  const whatsappHref = `https://wa.me/?text=${encodedText}`;
  const telegramHref = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(shareText)}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodedText}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const emailHref = `mailto:?subject=${encodedTitle}&body=${encodedText}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    onNotice("Link copied");
    onClose();
  }

  async function downloadImage() {
    try {
      await downloadCardImage(profile);
      onNotice("Card image downloaded — attach it in WhatsApp or anywhere");
      onClose();
    } catch {
      onNotice("Could not create image");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "image" ? "Share card image" : "Share link"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-line bg-cream p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              {mode === "image" ? "Share as image" : "Share link"}
            </h2>
            <p className="mt-1 text-sm text-mute">
              {mode === "image"
                ? "Open WhatsApp or another app, or download the image to attach yourself."
                : "Pick where to send your calling card link."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-mute hover:bg-paper hover:text-ink"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <SheetBtn href={whatsappHref} label="WhatsApp" accent>
            <MessageCircle className="size-5" />
          </SheetBtn>
          <SheetBtn href={telegramHref} label="Telegram">
            <Share2 className="size-5" />
          </SheetBtn>
          <SheetBtn href={xHref} label="X / Twitter">
            <Share2 className="size-5" />
          </SheetBtn>
          <SheetBtn href={facebookHref} label="Facebook">
            <Share2 className="size-5" />
          </SheetBtn>
          <SheetBtn href={emailHref} label="Email">
            <Mail className="size-5" />
          </SheetBtn>
          <button
            type="button"
            onClick={copy}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-3 text-sm font-medium text-ink hover:bg-cream"
          >
            <Copy className="size-5" />
            Copy link
          </button>
          {mode === "image" ? (
            <button
              type="button"
              onClick={downloadImage}
              className="col-span-2 flex flex-col items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-3 text-sm font-medium text-ink hover:bg-cream sm:col-span-3"
            >
              <Download className="size-5" />
              Download image (then attach in any app)
            </button>
          ) : null}
        </div>

        {mode === "image" ? (
          <p className="mt-3 text-xs leading-relaxed text-mute">
            On phones, the system share sheet can send the image file directly to WhatsApp. On
            desktop, download the image and attach it, or share the link above.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SheetBtn({
  href,
  label,
  children,
  accent,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium " +
        (accent
          ? "border-ink bg-ink text-cream hover:opacity-90"
          : "border-line bg-paper text-ink hover:bg-cream")
      }
    >
      {children}
      {label}
    </a>
  );
}

function Btn({
  icon,
  onClick,
  children,
  primary,
  disabled,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  children: string;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        "inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium disabled:opacity-60 " +
        (primary ? "bg-ink text-cream" : "border border-line bg-paper text-ink")
      }
    >
      {icon}
      {children}
    </button>
  );
}
