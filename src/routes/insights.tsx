import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PrivacyNote } from "@/components/privacy-note";
import { insightsSummary } from "@/lib/card-analytics";
import { readSettings } from "@/lib/app-settings";
import { readStoredProfile, slugify } from "@/lib/profile";

export const Route = createFileRoute("/insights")({ component: InsightsPage });

function InsightsPage() {
  const [enabled] = useState(() => readSettings().insightsEnabled);
  const cardKey = useMemo(() => {
    const p = readStoredProfile();
    return slugify(p?.username || p?.fullName || "my-card") || "my-card";
  }, []);
  const summary = insightsSummary(cardKey);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Feedback</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Anonymous insights</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Totals for opens, shares, and contact saves on this device. Not a feed. Not a leaderboard.
        Nobody sees who viewed you.
      </p>
      <PrivacyNote variant="anonymousStats" className="mt-4" />

      {!enabled ? (
        <p className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          Insights counting is off in{" "}
          <Link to="/settings" className="font-medium underline-offset-2 hover:underline">
            Settings
          </Link>
          . Turn it on if you want these totals.
        </p>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Today" views={summary.today.views} shares={summary.today.shares} saves={summary.today.saves} />
        <Stat label="This week" views={summary.week.views} shares={summary.week.shares} saves={summary.week.saves} />
        <Stat label="This month" views={summary.month.views} shares={summary.month.shares} saves={summary.month.saves} />
      </div>

      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
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
        <p className="mt-3 text-xs text-zinc-500">
          “Saves” means someone downloaded or shared the contact file — the outcome that matters.
        </p>
      </section>

      {summary.recentDays.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold">Recent days</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {summary.recentDays.map((d) => (
              <li key={d.day} className="flex justify-between gap-2 border-b border-zinc-100 py-1.5 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">{d.day}</span>
                <span>
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
        <Link to="/settings" className="underline-offset-2 hover:underline">
          Settings
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
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{views}</p>
      <p className="text-xs text-zinc-500">views</p>
      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
        {shares} shares · {saves} contact saves
      </p>
    </div>
  );
}
