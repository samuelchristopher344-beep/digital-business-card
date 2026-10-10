import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  Check,
  Contact,
  Image,
  QrCode,
  ScanLine,
  Share2,
  Shield,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { CallingCard } from "@/components/calling-card";
import { QrMark } from "@/components/qr-mark";
import { DEMO_PROFILE, publicCardUrl } from "@/lib/profile";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const demoUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/u/demo`
      : "/u/demo";

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* App-style hero: product in the frame */}
      <section className="border-b border-zinc-200/80 bg-gradient-to-b from-white to-zinc-50 dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-900">
        <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              <Sparkles className="size-3.5 text-amber-600" aria-hidden="true" />
              Digital calling card · no account required
            </div>

            <h1 className="font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl">
              Hand it over.
              <br />
              Save the contact.
              <br />
              <span className="text-zinc-500 dark:text-zinc-400">Get back to the room.</span>
            </h1>

            <p className="max-w-md text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              Your card, QR, and WhatsApp-ready image in one place. They save you in one tap —
              private notes stay only on your device.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/create"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-900/15 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-none"
              >
                Create your card
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                to="/scan"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <ScanLine className="size-4" aria-hidden="true" />
                Scan a card
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-600" /> Free to start
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-600" /> Works offline in browser
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-600" /> No who-viewed list
              </span>
            </div>
          </div>

          {/* Live product preview — this is what makes it feel like an app */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-amber-100/80 via-transparent to-zinc-200/50 dark:from-amber-900/20 dark:to-zinc-800/40" aria-hidden="true" />
            <div className="relative rounded-[1.75rem] border border-zinc-200/80 bg-white/80 p-4 shadow-2xl shadow-zinc-900/10 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/80 dark:shadow-black/40 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Live preview</p>
                <Link
                  to="/u/$slug"
                  params={{ slug: "demo" }}
                  className="text-xs font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-300"
                >
                  Open full card →
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
                <div className="min-w-0" data-theme="brass">
                  <CallingCard profile={DEMO_PROFILE} />
                </div>
                <div className="flex flex-col items-center gap-2 sm:w-36">
                  <QrMark value={demoUrl} label="Demo calling card QR" />
                  <p className="text-center text-[11px] leading-snug text-zinc-500">
                    Scan to open the demo card
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <PreviewChip icon={<Smartphone className="size-3.5" />} label="Save contact" />
                <PreviewChip icon={<Image className="size-3.5" />} label="Share image" />
                <PreviewChip icon={<Share2 className="size-3.5" />} label="Share link" />
                <PreviewChip icon={<QrCode className="size-3.5" />} label="QR" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — app flow, not manifesto */}
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">How it works</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Step n="1" title="Make your card" body="Name, role, links. Looks polished in under a minute." />
          <Step n="2" title="Hand it over" body="QR, WhatsApp image, or link — whatever fits the room." />
          <Step n="3" title="They save you" body="One-tap contact file. You keep private notes only you see." />
        </div>
      </section>

      {/* Action grid — feels like app home modules */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">Open in the app</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AppTile
            to="/create"
            icon={<Sparkles className="size-5" />}
            title="Create card"
            body="Build and share your calling card"
            primary
          />
          <AppTile
            to="/scan"
            icon={<ScanLine className="size-5" />}
            title="Scan"
            body="Point at a QR and open or save"
          />
          <AppTile
            to="/cards"
            icon={<Contact className="size-5" />}
            title="My cards"
            body="Work, personal, or event identities"
          />
          <AppTile
            to="/event-mode"
            icon={<Calendar className="size-5" />}
            title="Event mode"
            body="Temporary presence for one conference"
          />
          <AppTile
            to="/contacts"
            icon={<Shield className="size-5" />}
            title="Private contacts"
            body="Tags and notes only on your device"
          />
          <AppTile
            to="/u/$slug"
            params={{ slug: "demo" }}
            icon={<QrCode className="size-5" />}
            title="Try demo"
            body="Full public card with real actions"
          />
        </div>
      </section>

      {/* Short trust strip */}
      <section className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="max-w-md">
            <h2 className="font-serif text-2xl tracking-tight">Built to finish the handoff</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Account is optional. We never show who viewed your card. Done is the win — not time on
              the page.
            </p>
          </div>
          <Link
            to="/create"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Start your card
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function PreviewChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
      {icon}
      {label}
    </span>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="inline-flex size-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
        {n}
      </span>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{body}</p>
    </div>
  );
}

function AppTile({
  to,
  params,
  icon,
  title,
  body,
  primary,
}: {
  to: string;
  params?: Record<string, string>;
  icon: React.ReactNode;
  title: string;
  body: string;
  primary?: boolean;
}) {
  return (
    <Link
      to={to}
      params={params}
      className={
        "group flex items-start gap-3 rounded-2xl border p-4 transition-all " +
        (primary
          ? "border-zinc-900 bg-zinc-900 text-white shadow-lg shadow-zinc-900/10 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600")
      }
    >
      <span
        className={
          "mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl " +
          (primary
            ? "bg-white/15 text-white dark:bg-zinc-900/10 dark:text-zinc-900"
            : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100")
        }
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1 text-sm font-semibold">
          {title}
          <ArrowRight
            className={
              "size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 " +
              (primary ? "text-white/80 dark:text-zinc-700" : "text-zinc-400")
            }
          />
        </span>
        <span
          className={
            "mt-0.5 block text-sm leading-snug " +
            (primary ? "text-white/75 dark:text-zinc-600" : "text-zinc-500 dark:text-zinc-400")
          }
        >
          {body}
        </span>
      </span>
    </Link>
  );
}

// silence unused import if tree-shaken oddly
void publicCardUrl;
