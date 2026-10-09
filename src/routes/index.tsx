import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, QrCode, ScanLine, Share2, UserPlus, Shield } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 py-10 sm:px-6 sm:py-16">
        <header className="flex flex-col gap-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">
            Digital business card
          </p>
          <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            Your card.
            <br />
            Your link.
            <br />
            Not someone else&apos;s.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400">
            Create a modern calling card in under a minute. Share a clean link or QR code.
            Private notes and tags stay only on your device.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/create"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-zinc-900 px-6 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Create your card
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to="/scan"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <ScanLine className="size-4" aria-hidden="true" />
              Scan QR
            </Link>
            <Link
              to="/u/$slug"
              params={{ slug: "demo" }}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              View demo card
            </Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={<UserPlus className="size-5" />}
            title="Start blank"
            body="No one else's name on the homepage. You fill in your details."
          />
          <Feature
            icon={<QrCode className="size-5" />}
            title="QR + save on phone"
            body="Open-card QR, contact QR, and .vcf for Apple & Google Contacts."
          />
          <Feature
            icon={<Shield className="size-5" />}
            title="Private by default"
            body="Tags, notes, blocks, and insights are labeled clearly and stay yours."
          />
          <Feature
            icon={<ScanLine className="size-5" />}
            title="Scan in-app"
            body="Scan a Calling Card QR from WhatsApp or another phone."
          />
          <Feature
            icon={<Share2 className="size-5" />}
            title="Shareable link"
            body="Get a /u/yourname link for socials, email, or print."
          />
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Tools</h2>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link to="/settings" className="font-medium underline-offset-2 hover:underline">
              Settings
            </Link>
            <Link to="/event-mode" className="font-medium underline-offset-2 hover:underline">
              Event mode
            </Link>
            <Link to="/availability" className="font-medium underline-offset-2 hover:underline">
              Free to chat
            </Link>
            <Link to="/contacts" className="font-medium underline-offset-2 hover:underline">
              Private contacts
            </Link>
            <Link to="/insights" className="font-medium underline-offset-2 hover:underline">
              Insights
            </Link>
            <Link to="/security" className="font-medium underline-offset-2 hover:underline">
              Security
            </Link>
            <Link to="/privacy" className="font-medium underline-offset-2 hover:underline">
              Privacy center
            </Link>
            <Link to="/edit" className="font-medium underline-offset-2 hover:underline">
              Edit my card
            </Link>
            <Link to="/login" className="text-zinc-500 underline-offset-2 hover:underline">
              Sign in
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-zinc-800 dark:text-zinc-100">{icon}</div>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{body}</p>
    </div>
  );
}
