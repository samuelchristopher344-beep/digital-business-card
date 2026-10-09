import { createFileRoute, Link } from "@tanstack/react-router";
import { PRIVACY_COPY } from "@/lib/privacy-vault";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Trust</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Privacy center</h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600">
        Calling Card is built so private tools stay private. If something might look “linked” or
        public, we label it clearly.
      </p>

      <section className="mt-8 space-y-4">
        <Block title="What other people can see">
          Only what you put on your <strong>public card</strong>: name, role, links, QR, and anything
          you choose to publish. They cannot see your tags, private notes, block list, or login
          history.
        </Block>
        <Block title="Private notes & tags">{PRIVACY_COPY.onlyYou} {PRIVACY_COPY.notLinked}</Block>
        <Block title="Insights (views / shares)">{PRIVACY_COPY.anonymousStats}</Block>
        <Block title="Block">{PRIVACY_COPY.block}</Block>
        <Block title="Report">{PRIVACY_COPY.report}</Block>
        <Block title="Location / address country">
          We do <strong>not</strong> require GPS. You pick a country yourself only to format your
          address field. Nothing is tracked in the background.
        </Block>
        <Block title="Where data lives today">
          Notes, tags, blocks, local insights, event timer, and free-to-chat status are stored in{" "}
          <strong>this browser or phone</strong> (localStorage). Clearing site data removes them.
          Server accounts only store what you explicitly save to your account.
        </Block>
      </section>

      <nav className="mt-10 flex flex-wrap gap-3 text-sm">
        <Link to="/contacts" className="font-medium underline-offset-2 hover:underline">
          My private contacts
        </Link>
        <Link to="/insights" className="font-medium underline-offset-2 hover:underline">
          Insights
        </Link>
        <Link to="/security" className="font-medium underline-offset-2 hover:underline">
          Security
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
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">{children}</p>
    </div>
  );
}
