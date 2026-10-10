import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  Check,
  Contact,
  Image,
  Link2,
  QrCode,
  ScanLine,
  Share2,
  Shield,
  Smartphone,
  Sparkles,
  X,
} from "lucide-react";
import { CallingCard } from "@/components/calling-card";
import { QrMark } from "@/components/qr-mark";
import { DEMO_PROFILE } from "@/lib/profile";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const demoUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/u/demo`
      : "/u/demo";

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <section className="border-b border-zinc-200/80 bg-gradient-to-b from-white to-zinc-50 dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-900">
        <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              <Sparkles className="size-3.5 text-amber-600" aria-hidden="true" />
              Digital calling card · account optional
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
                <Check className="size-3.5 text-emerald-600" /> No account needed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-600" /> No who-viewed list
              </span>
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-amber-100/80 via-transparent to-zinc-200/50 dark:from-amber-900/20 dark:to-zinc-800/40"
              aria-hidden="true"
            />
            <div className="relative rounded-[1.75rem] border border-zinc-200/80 bg-white/80 p-4 shadow-2xl shadow-zinc-900/10 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/80 dark:shadow-black/40 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                  Live preview
                </p>
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

      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">How it works</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Step n="1" title="Make your card" body="Name, role, links. Looks polished in under a minute." />
          <Step n="2" title="Hand it over" body="QR, WhatsApp image, or link — whatever fits the room." />
          <Step n="3" title="They save you" body="One-tap contact file. You keep private notes only you see." />
        </div>
      </section>

      {/* Account: clear yes / no decision */}
      <section className="border-y border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-serif text-2xl tracking-tight sm:text-3xl">
              Account is optional — here’s when it helps
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              You can create, share, and scan without signing up. An account only adds backup and a
              permanent public link across devices.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {/* Without account */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6 dark:border-zinc-700 dark:bg-zinc-950">
              <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                Without an account
              </p>
              <h3 className="mt-1 text-lg font-semibold">Start now in this browser</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <Row ok>Create and edit your card</Row>
                <Row ok>Share image, link, and QR</Row>
                <Row ok>Save contacts and private notes on this device</Row>
                <Row ok>Scan other people’s cards</Row>
                <Row no>Card may be lost if you clear browser data</Row>
                <Row no>Not available automatically on your other phone</Row>
                <Row no>No permanent claimed username across devices</Row>
              </ul>
              <Link
                to="/create"
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white text-sm font-semibold text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              >
                Continue without signing up
              </Link>
            </div>

            {/* With account */}
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900 p-5 text-white sm:p-6 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">
              <p className="text-xs font-semibold tracking-wide text-white/60 uppercase dark:text-zinc-500">
                With an account
              </p>
              <h3 className="mt-1 text-lg font-semibold">Same card on every device</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <Row ok light>
                  <span className="inline-flex items-center gap-1.5">
                    <Smartphone className="size-3.5 shrink-0" /> Card syncs to phone and laptop
                  </span>
                </Row>
                <Row ok light>
                  <span className="inline-flex items-center gap-1.5">
                    <Link2 className="size-3.5 shrink-0" /> Claim a stable public link (/u/you)
                  </span>
                </Row>
                <Row ok light>Multiple cards (work, personal, event) stay backed up</Row>
                <Row ok light>Sign in anywhere — your cards are already there</Row>
                <Row ok light>Still private: no who-viewed list, notes stay on device</Row>
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-white/65 dark:text-zinc-600">
                Best if you’ll reuse the same card often or switch devices.
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Link
                  to="/signup"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  Create account
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-white/25 text-sm font-medium text-white dark:border-zinc-400 dark:text-zinc-900"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-zinc-500">
            Not sure?{" "}
            <Link to="/create" className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200">
              Make a card first
            </Link>
            {" "}
            — you can add an account later without starting over.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">Open in the app</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/create"
            className="group flex items-start gap-3 rounded-2xl border border-zinc-900 bg-zinc-900 p-4 text-white shadow-lg shadow-zinc-900/10 transition-all dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
          >
            <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-white/15 text-white dark:bg-zinc-900/10 dark:text-zinc-900">
              <Sparkles className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1 text-sm font-semibold">
                Create card
                <ArrowRight className="size-3.5 text-white/80 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-zinc-700" />
              </span>
              <span className="mt-0.5 block text-sm leading-snug text-white/75 dark:text-zinc-600">
                Build and share your calling card
              </span>
            </span>
          </Link>

          <AppTile to="/scan" icon={<ScanLine className="size-5" />} title="Scan" body="Point at a QR and open or save" />
          <AppTile to="/cards" icon={<Contact className="size-5" />} title="My cards" body="Work, personal, or event identities" />
          <AppTile to="/event-mode" icon={<Calendar className="size-5" />} title="Event mode" body="Temporary presence for one conference" />
          <AppTile to="/contacts" icon={<Shield className="size-5" />} title="Private contacts" body="Tags and notes only on your device" />

          <Link
            to="/u/$slug"
            params={{ slug: "demo" }}
            className="group flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
          >
            <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
              <QrCode className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1 text-sm font-semibold">
                Try demo
                <ArrowRight className="size-3.5 text-zinc-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </span>
              <span className="mt-0.5 block text-sm leading-snug text-zinc-500 dark:text-zinc-400">
                Full public card with real actions
              </span>
            </span>
          </Link>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="max-w-md">
            <h2 className="font-serif text-2xl tracking-tight">Built to finish the handoff</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Sign up only if you want the same card on another device. We never show who viewed
              your card.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/create"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Start your card
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/signup"
              className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium dark:border-zinc-600"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Row({
  children,
  ok,
  no,
  light,
}: {
  children: React.ReactNode;
  ok?: boolean;
  no?: boolean;
  light?: boolean;
}) {
  return (
    <li className="flex items-start gap-2.5">
      {ok ? (
        <Check
          className={
            "mt-0.5 size-4 shrink-0 " +
            (light ? "text-emerald-400 dark:text-emerald-700" : "text-emerald-600")
          }
        />
      ) : (
        <X className="mt-0.5 size-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
      )}
      <span
        className={
          no
            ? light
              ? "text-white/55 dark:text-zinc-500"
              : "text-zinc-500"
            : light
              ? "text-white/90 dark:text-zinc-800"
              : "text-zinc-700 dark:text-zinc-300"
        }
      >
        {children}
      </span>
    </li>
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
  icon,
  title,
  body,
}: {
  to: "/scan" | "/cards" | "/event-mode" | "/contacts";
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
    >
      <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1 text-sm font-semibold">
          {title}
          <ArrowRight className="size-3.5 text-zinc-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-zinc-500 dark:text-zinc-400">{body}</span>
      </span>
    </Link>
  );
}
