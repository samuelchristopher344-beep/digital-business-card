import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, QrCode, ScanLine, Shield, Smartphone } from "lucide-react";
import { PRINCIPLES, PRODUCT_JOB } from "@/lib/incentives";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 py-10 sm:px-6 sm:py-16">
        <header className="flex flex-col gap-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">
            Calling Card
          </p>
          <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            Hand it over.
            <br />
            Save the contact.
            <br />
            Get back to the room.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400">
            {PRODUCT_JOB} Share as image for WhatsApp. Multiple cards. Optional account.
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
              Scan a card
            </Link>
          </div>
          <p className="text-sm text-zinc-500">
            <Link to="/cards" className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200">
              Manage cards
            </Link>
            {" · "}
            <Link to="/edit" className="underline-offset-2 hover:underline">
              Editor
            </Link>
            {" · "}
            <Link to="/u/$slug" params={{ slug: "demo" }} className="underline-offset-2 hover:underline">
              Demo
            </Link>
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <Feature
            icon={<Smartphone className="size-5" />}
            title="Save to the phone"
            body="One tap .vcf for Apple or Google Contacts. Share as image for WhatsApp."
          />
          <Feature
            icon={<QrCode className="size-5" />}
            title="QR that finishes"
            body="Open the card or save the contact — then close the tab."
          />
          <Feature
            icon={<Shield className="size-5" />}
            title="Private by default"
            body="Notes and tags stay on your device. Counts stay anonymous."
          />
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">How we align with you</h2>
          <ul className="mt-5 space-y-4">
            {PRINCIPLES.map((p) => (
              <li key={p.title}>
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{p.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Tools</h2>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link to="/cards" className="font-medium underline-offset-2 hover:underline">
              Multi-card
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
            <Link to="/settings" className="font-medium underline-offset-2 hover:underline">
              Settings
            </Link>
            <Link to="/privacy" className="font-medium underline-offset-2 hover:underline">
              Privacy
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
