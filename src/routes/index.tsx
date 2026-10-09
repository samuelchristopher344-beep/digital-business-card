import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, QrCode, ScanLine, Share2, UserPlus } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 py-12 sm:px-6 sm:py-20">
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
          <p className="max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
            Create a modern calling card in under a minute. Share a clean link or QR code.
            Others land on <strong>your</strong> profile — not a seeded demo.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/create"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-zinc-900 px-6 text-sm font-medium text-white"
            >
              Create your card
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to="/scan"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-800"
            >
              <ScanLine className="size-4" aria-hidden="true" />
              Scan QR
            </Link>
            <Link
              to="/u/$slug"
              params={{ slug: "demo" }}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-800"
            >
              View demo card
            </Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon={<UserPlus className="size-5" />}
            title="Start blank"
            body="No one else's name on the homepage. You fill in your details."
          />
          <Feature
            icon={<QrCode className="size-5" />}
            title="QR + contact file"
            body="Open-card QR, MeCard contact QR, and one-tap .vcf download."
          />
          <Feature
            icon={<ScanLine className="size-5" />}
            title="Scan in-app"
            body="Scan a Calling Card QR from WhatsApp or another phone inside this app."
          />
          <Feature
            icon={<Share2 className="size-5" />}
            title="Shareable link"
            body="Get a /u/yourname link you can put on socials, email, or print."
          />
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-semibold">How it works today</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-600">
            <li>Tap <strong>Create your card</strong> and fill your profile.</li>
            <li>Pick a username — your public page becomes <code className="rounded bg-zinc-100 px-1">/u/username</code>.</li>
            <li>Copy the link or show the QR. Anyone who opens it sees only your card.</li>
            <li>
              Someone else using this app can tap <strong>Scan QR</strong> and read your code from
              WhatsApp or another screen.
            </li>
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/create" className="text-sm font-medium text-zinc-900 underline-offset-2 hover:underline">
              Create card
            </Link>
            <Link to="/scan" className="text-sm font-medium text-zinc-900 underline-offset-2 hover:underline">
              Scan QR
            </Link>
            <Link to="/edit" className="text-sm font-medium text-zinc-900 underline-offset-2 hover:underline">
              Edit my card
            </Link>
            <Link to="/login" className="text-sm font-medium text-zinc-500 underline-offset-2 hover:underline">
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
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="text-zinc-800">{icon}</div>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{body}</p>
    </div>
  );
}
