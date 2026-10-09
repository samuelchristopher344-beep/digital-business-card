import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PrivacyNote } from "@/components/privacy-note";
import { insightsSummary, isProLocal, setProLocal } from "@/lib/card-analytics";
import { readStoredProfile, slugify } from "@/lib/profile";

export const Route = createFileRoute("/insights")({ component: InsightsPage });

function InsightsPage() {
  const [pro, setPro] = useState(() => isProLocal());
  const cardKey = useMemo(() => {
    const p = readStoredProfile();
    return slugify(p?.username || p?.fullName || "my-card") || "my-card";
  }, []);
  const summary = insightsSummary(cardKey);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Analytics</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Card insights</h1>
      <p className="mt-2 text-sm text-zinc-600">
        How often your card was opened, shared, or saved as a contact — on this device’s counters.
      </p>
      <PrivacyNote variant="anonymousStats" className="mt-4" />

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Today" views={summary.today.views} shares={summary.today.shares} saves={summary.today.saves} />
        <Stat label="This week" views={summary.week.views} shares={summary.week.shares} saves={summary.week.saves} />
        {pro ? (
          <Stat label="This month" views={summary.month.views} shares={summary.month.shares} saves={summary.month.saves} />
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-semibold">This month</p>
            <p className="mt-1 text-xs leading-relaxed">
              Month-level detail is a Pro insight. Today and this week stay free.
            </p>
            <button
              type="button"
              className="mt-3 text-xs font-medium underline underline-offset-2"
              onClick={() => {
                setProLocal(true);
                setPro(true);
              }}
            >
              Preview Pro on this device
            </button>
          </div>
        )}
      </div>

      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold">All time (this device)</h2>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <dt className="text-xs text-zinc-500">Views</dt>
            <dd className="text-xl font-semibold">{summary.allTime.views}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Shares</dt>
            <dd className="text-xl font-semibold">{summary.allTime.shares}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Saves</dt>
            <dd className="text-xl font-semibold">{summary.allTime.saves}</dd>
          </div>
        </dl>
      </section>

      {pro && summary.recentDays.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold">Recent days</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {summary.recentDays.map((d) => (
              <li key={d.day} className="flex justify-between gap-2 border-b border-zinc-100 py-1.5">
                <span className="text-zinc-600">{d.day}</span>
                <span className="text-zinc-900">
                  {d.views} views · {d.shares} shares · {d.saves} saves
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-8 text-center text-sm text-zinc-500">
        <Link to="/privacy" className="underline-offset-2 hover:underline">
          Privacy
        </Link>
        {" · "}
        <Link to="/edit" className="underline-offset-2 hover:underline">
          Edit card
        </Link>
        {" · "}
        <Link to="/" className="underline-offset-2 hover:underline">
          Home
        </Link>
      </p>
    </main>
  );
}

function Stat({
  label,
  views,
  shares,
  saves,
}: {
  label: string;
  views: number;
  shares: number;
  saves: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{views}</p>
      <p className="text-xs text-zinc-500">views</p>
      <p className="mt-2 text-xs text-zinc-600">
        {shares} shares · {saves} contact saves
      </p>
    </div>
  );
}
