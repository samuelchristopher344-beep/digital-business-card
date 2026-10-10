import { useState } from "react";
import { Check, Copy, Download, Image, Mail, Smartphone, Share2 } from "lucide-react";
import { copyEmailSignature } from "@/lib/email-signature";
import { homeScreenInstructions } from "@/lib/home-screen";
import { publicCardUrl, type Profile } from "@/lib/profile";
import { downloadVCard, shareVCardToPhone } from "@/lib/save-contact";
import { shareCardImage } from "@/lib/share-image";

export function ShareActions({ profile, cardKey }: { profile: Profile; cardKey?: string }) {
  const [notice, setNotice] = useState("");

  function flash(msg: string) {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 2800);
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
        <Btn
          icon={<Image className="size-4" />}
          onClick={async () => {
            try {
              const r = await shareCardImage(profile);
              if (r === "shared") flash("Image shared — perfect for WhatsApp");
              else if (r === "downloaded") flash("Card image downloaded");
            } catch {
              flash("Could not create image");
            }
          }}
        >
          Share as image
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
            await navigator.clipboard.writeText(publicCardUrl(profile));
            flash("Link copied");
          }}
        >
          Copy link
        </Btn>
        <Btn
          icon={<Share2 className="size-4" />}
          onClick={async () => {
            const url = publicCardUrl(profile);
            if (navigator.share) {
              try {
                await navigator.share({
                  title: profile.fullName || "Calling Card",
                  text: profile.role || profile.tagline,
                  url,
                });
                return;
              } catch (e) {
                if (e instanceof DOMException && e.name === "AbortError") return;
              }
            }
            await navigator.clipboard.writeText(url);
            flash("Link copied");
          }}
        >
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
    </div>
  );
}

function Btn({
  icon,
  onClick,
  children,
  primary,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  children: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium " +
        (primary
          ? "bg-ink text-cream"
          : "border border-line bg-paper text-ink")
      }
    >
      {icon}
      {children}
    </button>
  );
}
