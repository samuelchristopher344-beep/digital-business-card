import type { ReactNode } from "react";
import { Github, Globe, Mail, MapPin, Phone } from "lucide-react";
import {
  CARD_TYPES,
  displayHost,
  formatPhoneDisplay,
  getFullPhone,
  githubHref,
  githubLabel,
  hrefForWebsite,
  initials,
  type Profile,
} from "@/lib/profile";

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
      <span className="mt-0.5 text-accent" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs whitespace-nowrap tracking-wide text-card-mute uppercase">{label}</span>
        <span className="block truncate text-sm text-card-fg">{value}</span>
      </span>
    </>
  );

  if (!href) {
    return <li className="flex items-start gap-3">{body}</li>;
  }

  return (
    <li>
      <a
        href={href}
        className="flex items-start gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent"
        {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {body}
      </a>
    </li>
  );
}

export function CallingCard({ profile }: { profile: Profile }) {
  const site = hrefForWebsite(profile.website);
  const github = githubHref(profile.github);
  const name = profile.fullName.trim() || "Your name";
  const fullPhone = getFullPhone(profile);
  const phoneDisplay = formatPhoneDisplay(profile);
  const typeLabel = CARD_TYPES.find((t) => t.id === profile.cardType)?.label || "Personal";

  return (
    <article className="card-rise overflow-hidden rounded-card bg-card text-card-fg shadow-card">
      <div className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-7 sm:pt-7">
        <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-accent text-ink">
          <span className="font-display text-lg leading-none">{initials(profile.fullName)}</span>
        </div>
        <div className="text-right">
          <p className="text-xs leading-relaxed tracking-widest text-card-mute uppercase">
            {profile.organization.trim() || typeLabel}
          </p>
        </div>
      </div>

      <div className="px-6 pt-8 sm:px-7">
        <h1 className="font-display text-4xl leading-tight font-medium text-balance text-card-fg">{name}</h1>
        {profile.role ? <p className="mt-3 text-sm tracking-wide text-accent">{profile.role}</p> : null}
        {profile.tagline ? (
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-card-mute">{profile.tagline}</p>
        ) : null}
      </div>

      <div className="mx-6 mt-6 border-t border-card-line sm:mx-7" />

      <ul className="grid gap-3 px-6 py-5 sm:px-7">
        {profile.email ? (
          <Row href={`mailto:${profile.email}`} icon={<Mail className="size-4" />} label="Email" value={profile.email} />
        ) : null}
        {fullPhone ? (
          <Row href={`tel:${fullPhone}`} icon={<Phone className="size-4" />} label="Phone" value={phoneDisplay || fullPhone} />
        ) : null}
        {site ? (
          <Row href={site} icon={<Globe className="size-4" />} label="Web" value={displayHost(profile.website)} />
        ) : null}
        {profile.location ? (
          <Row icon={<MapPin className="size-4" />} label="Base" value={profile.location} />
        ) : null}
        {github ? (
          <Row href={github} icon={<Github className="size-4" />} label="GitHub" value={githubLabel(profile.github)} />
        ) : null}
      </ul>

      {profile.focus.length > 0 ? (
        <ul className="flex flex-wrap gap-2 px-6 pb-6 sm:px-7 sm:pb-7">
          {profile.focus.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-card-line px-2.5 py-1 text-xs tracking-wide text-card-mute uppercase"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : (
        <div className="h-2" />
      )}
    </article>
  );
}
