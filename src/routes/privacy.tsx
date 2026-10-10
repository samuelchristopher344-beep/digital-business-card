import { createFileRoute, Link } from "@tanstack/react-router";
import { PRINCIPLES, PRODUCT_JOB } from "@/lib/incentives";
import { PRIVACY_COPY } from "@/lib/privacy-vault";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Trust</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Privacy & incentives</h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{PRODUCT_JOB}</p>

      <section className="mt-8 space-y-4">
        <Block title="What other people can see">
          Only what you put on your <strong>public card</strong>: name, role, links, QR, and anything
          you choose to show. They cannot see your tags, private notes, block list, or login history.
          We do <strong>not</strong> show who viewed your card.
        </Block>
        <Block title="Private notes & tags">{PRIVACY_COPY.onlyYou} {PRIVACY_COPY.notLinked}</Block>
        <Block title="Insights">{PRIVACY_COPY.anonymousStats}</Block>
        <Block title="Block">{PRIVACY_COPY.block}</Block>
        <Block title="Report">{PRIVACY_COPY.report}</Block>
        <Block title="Location">
          We do not require GPS. Country for address format is something <strong>you</strong> pick in
          Settings.
        </Block>
        <Block title="Account">
          Optional. Create and share a card in this browser without signing up. Sign in only if you
          want the same card on another device.
        </Block>
        <Block title="Where data lives">
          Notes, tags, blocks, local insights, event timer, and free-to-chat status live in{" "}
          <strong>this browser or phone</strong>. Clearing site data removes them. Server accounts
          only store what you explicitly save.
        </Block>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Product principles</h2>
        <ul className="mt-4 space-y-3">
          {PRINCIPLES.map((p) => (
            <li key={p.title} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-semibold">{p.title}</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <nav className="mt-10 flex flex-wrap gap-3 text-sm">
        <Link to="/settings" className="font-medium underline-offset-2 hover:underline">
          Settings
        </Link>
        <Link to="/contacts" className="font-medium underline-offset-2 hover:underline">
          Private contacts
        </Link>
        <Link to="/" className="text-zinc-500 underline-offset-2 hover:underline">
          Home
        </Link>
      </nav>
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{children}</p>
    </div>
  );
}
