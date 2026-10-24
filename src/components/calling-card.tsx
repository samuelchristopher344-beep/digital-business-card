import type { ReactNode } from "react";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import {
  CARD_TYPES,
  displayHost,
  formatPhoneDisplay,
  getFullPhone,
  hrefForWebsite,
  initials,
  whatsappHref,
  telegramHref,
  linkedinHref,
  instagramHref,
  xHref,
  type Profile,
} from "@/lib/profile";
import { nameSizeClass, showcaseImageUrl } from "@/lib/showcase";
import { ShowcaseImage } from "@/components/showcase-image";
import { QrMark } from "@/components/qr-mark";

function Row({
  href,
  icon,
  label,
  value,
}: {
  href?: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  const body = (
    <>
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs whitespace-nowrap tracking-wide text-card-mute uppercase">{label}</span>
        <span className="block truncate text-sm text-card-fg">{value}</span>
      </span>
    </>
  );

  if (!href) {
    return <li className="flex items-center gap-3">{body}</li>;
  }

  return (
    <li>
      <a
        href={href}
        className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent"
        {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {body}
      </a>
    </li>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="#25D366">
      <path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1 0 1.2.9 2.4 1 2.5.1.2 1.8 2.8 4.4 3.9 2.6 1.1 2.6.7 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3z" />
      <path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.4 5.1L2 22l5-1.3c1.5.8 3.1 1.3 5 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3C4.4 15.1 4 13.6 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="#26A5E4">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.6 6.5l-1.7 8c-.1.6-.5.7-1 .4l-2.8-2.1-1.4 1.3c-.1.1-.3.2-.5.2l.2-2.8 5.1-4.6c.2-.2 0-.3-.3-.1l-6.3 4-2.7-.8c-.6-.2-.6-.6.1-.9l10.5-4c.5-.2.9.1.8.9z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="#E4405F">
      <path d="M12 2.2c2.7 0 3 0 4.1.1 1 .1 1.5.2 1.9.4.5.2.8.4 1.2.8.4.4.6.7.8 1.2.2.4.3.9.4 1.9.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c-.1 1-.2 1.5-.4 1.9-.2.5-.4.8-.8 1.2-.4.4-.7.6-1.2.8-.4.2-.9.3-1.9.4-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-1-.1-1.5-.2-1.9-.4-.5-.2-.8-.4-1.2-.8-.4-.4-.6-.7-.8-1.2-.2-.4-.3-.9-.4-1.9-.1-1.1-.1-1.4-.1-4.1s0-3 .1-4.1c.1-1 .2-1.5.4-1.9.2-.5.4-.8.8-1.2.4-.4.7-.6 1.2-.8.4-.2.9-.3 1.9-.4 1.1-.1 1.4-.1 4.1-.1zM12 4c-2.6 0-2.9 0-4 .1-.9.1-1.4.2-1.7.3-.4.2-.7.4-.9.7-.3.2-.5.5-.7.9-.1.3-.2.8-.3 1.7-.1 1.1-.1 1.4-.1 4s0 2.9.1 4c.1.9.2 1.4.3 1.7.2.4.4.7.7.9.2.3.5.5.9.7.3.1.8.2 1.7.3 1.1.1 1.4.1 4 .1s2.9 0 4-.1c.9-.1 1.4-.2 1.7-.3.4-.2.7-.4.9-.7.3-.2.5-.5.7-.9.1-.3.2-.8.3-1.7.1-1.1.1-1.4.1-4s0-2.9-.1-4c-.1-.9-.2-1.4-.3-1.7-.2-.4-.4-.7-.7-.9-.2-.3-.5-.5-.9-.7-.3-.1-.8-.2-1.7-.3-1.1-.1-1.4-.1-4-.1z" />
      <path d="M12 7.4c-2.5 0-4.6 2.1-4.6 4.6s2.1 4.6 4.6 4.6 4.6-2.1 4.6-4.6-2.1-4.6-4.6-4.6zm0 7.6c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
      <circle cx="17.3" cy="6.7" r="1.1" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="#0A66C2">
      <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.3a1.8 1.8 0 110-3.6 1.8 1.8 0 010 3.6zM19 19h-3v-4.7c0-1.1 0-2.5-1.5-2.5s-1.7 1.2-1.7 2.4V19h-3v-9h2.9v1.2h.1c.4-.8 1.4-1.6 2.9-1.6 3.1 0 3.7 2 3.7 4.7V19z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <path d="M18.2 2.2h3.3l-7.2 8.2 8.5 11.2h-6.7l-5.2-6.8-6 6.8H1.6l7.7-8.8L1.1 2.2h6.9l4.7 6.2 5.5-6.2zm-1.2 17.4h1.8L7.1 4h-2L17 19.6z" />
    </svg>
  );
}

function InitialsAvatar({ name }: { name: string }) {
  const letters = initials(name);
  return (
    <div
      className="grid size-14 shrink-0 place-items-center rounded-full border-2 border-accent text-accent"
      aria-hidden="true"
    >
      <span className="font-display text-lg leading-none font-semibold tracking-wide">
        {letters}
      </span>
    </div>
  );
}

function ShowcaseStrip({ profile }: { profile: Profile }) {
  const items = profile.showcase ?? [];
  if (items.length === 0) return null;

  return (
    <div className="px-6 pb-4 sm:px-7">
      <p className="mb-3 flex items-center gap-2 text-xs tracking-widest text-card-mute uppercase">
        <span className="size-2 rounded-full bg-accent" />
        Showcase
      </p>
      <ul className="grid grid-cols-3 gap-3">
        {items.slice(0, 3).map((item) => {
          const src = showcaseImageUrl(item.text, profile.cardType, item.style ?? "auto");
          return (
            <li key={item.id} className="min-w-0">
              <div className="overflow-hidden rounded-xl border border-card-line bg-paper aspect-[4/5]">
                {item.photoUrl ? (
                  <ShowcaseImage src={item.photoUrl} />
                ) : src ? (
                  <ShowcaseImage src={src} />
                ) : (
                  <div className="h-full w-full bg-card-line/40" />
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-center text-[11px] leading-snug text-card-mute">{item.text}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CallingCard({
  profile,
  qrValue,
  qrLabel,
}: {
  profile: Profile;
  qrValue?: string;
  qrLabel?: string;
}) {
  const site = hrefForWebsite(profile.website);
  const wa = whatsappHref(profile.whatsapp);
  const tg = telegramHref(profile.telegram);
  const li = linkedinHref(profile.linkedin);
  const ig = instagramHref(profile.instagram);
  const xLink = xHref(profile.x);
  const name = profile.fullName.trim() || "Your name";
  const fullPhone = getFullPhone(profile);
  const phoneDisplay = formatPhoneDisplay(profile);
  const typeLabel = CARD_TYPES.find((t) => t.id === profile.cardType)?.label || "Personal";
  const hasShowcase = (profile.showcase ?? []).length > 0;
  const nameClass = nameSizeClass(profile.cardType || "personal", hasShowcase);
  const orgLine = profile.organization.trim() || typeLabel;

  return (
    <article className="card-rise overflow-hidden rounded-card bg-card text-card-fg shadow-card">
      <div className="flex items-center justify-between gap-3 px-6 pt-6 sm:px-7 sm:pt-7">
        <div className="flex min-w-0 items-center gap-3">
          <InitialsAvatar name={profile.fullName} />
          <p className="truncate text-sm font-medium tracking-wide text-card-mute">{orgLine}</p>
        </div>
        <span className="shrink-0 rounded-full border border-accent/50 px-3.5 py-1 text-xs font-medium tracking-wide text-accent">
          {typeLabel}
        </span>
      </div>

      <div className="px-6 pt-5 sm:px-7">
        <h1 className={nameClass}>{name}</h1>
        {profile.role ? <p className="mt-1.5 text-lg font-medium tracking-wide text-accent">{profile.role}</p> : null}
        {profile.tagline ? (
          <p className="mt-2 max-w-md text-sm leading-relaxed text-card-mute">{profile.tagline}</p>
        ) : null}

        {profile.focus.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {profile.focus.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-card-line bg-paper/50 px-3 py-1 text-xs tracking-wide text-card-mute"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        {profile.scanMessage?.trim() ? (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-card-line bg-paper/70 px-3.5 py-2.5 text-sm text-card-fg">
            <WhatsAppIcon />
            <span className="leading-relaxed">{profile.scanMessage.trim()}</span>
          </div>
        ) : null}
      </div>

      <div className="mx-6 mt-5 border-t border-card-line sm:mx-7" />

      <ShowcaseStrip profile={profile} />

      <ul className="grid gap-3.5 px-6 py-4 sm:px-7">
        {profile.email ? (
          <Row href={`mailto:${profile.email}`} icon={<Mail className="size-5" />} label="Email" value={profile.email} />
        ) : null}
        {fullPhone ? (
          <Row href={`tel:${fullPhone}`} icon={<Phone className="size-5" />} label="Phone" value={phoneDisplay || fullPhone} />
        ) : null}
        {wa ? <Row href={wa} icon={<WhatsAppIcon />} label="WhatsApp" value={profile.whatsapp} /> : null}
        {tg ? (
          <Row href={tg} icon={<TelegramIcon />} label="Telegram" value={profile.telegram.replace(/^@/, "")} />
        ) : null}
        {li ? (
          <Row
            href={li}
            icon={<LinkedInIcon />}
            label="LinkedIn"
            value={profile.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "")}
          />
        ) : null}
        {ig ? (
          <Row href={ig} icon={<InstagramIcon />} label="Instagram" value={profile.instagram.replace(/^@/, "")} />
        ) : null}
        {xLink ? <Row href={xLink} icon={<XIcon />} label="X" value={profile.x.replace(/^@/, "")} /> : null}
        {site ? (
          <Row href={site} icon={<Globe className="size-5" />} label="Web" value={displayHost(profile.website)} />
        ) : null}
        {profile.location ? (
          <Row icon={<MapPin className="size-5" />} label="Base" value={profile.location} />
        ) : null}
      </ul>

      {qrValue ? (
        <div className="flex flex-col items-center gap-2 px-6 pb-6 pt-2 sm:px-7">
          <QrMark value={qrValue} label={qrLabel || "QR code for this card"} />
          <p className="text-center text-sm font-medium text-accent">Scan to open full card + gallery</p>
          <p className="text-center text-xs text-card-mute">/{profile.username || "card"} · calling card</p>
        </div>
      ) : null}
    </article>
  );
}
