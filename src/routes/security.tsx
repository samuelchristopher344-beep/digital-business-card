import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PrivacyNote } from "@/components/privacy-note";
import {
  listBlocks,
  listLoginAlerts,
  loginAlertsEnabled,
  setLoginAlertsEnabled,
  unblockKey,
} from "@/lib/privacy-vault";

export const Route = createFileRoute("/security")({ component: SecurityPage });

function SecurityPage() {
  const [alertsOn, setAlertsOn] = useState(() => loginAlertsEnabled());
  const [tick, setTick] = useState(0);
  const blocks = listBlocks();
  const alerts = listLoginAlerts();

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Account</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Security</h1>

      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold">Login alerts</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Record when this device sees sign-in activity. Alerts stay on this device until email
          delivery is configured on the server.
        </p>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={alertsOn}
            onChange={(e) => {
              setLoginAlertsEnabled(e.target.checked);
              setAlertsOn(e.target.checked);
            }}
          />
          Enable login alerts on this device
        </label>
        <ul className="mt-4 space-y-2 text-sm">
          {alerts.length === 0 ? (
            <li className="text-zinc-500">No alerts yet.</li>
          ) : (
            alerts.map((a) => (
              <li key={a.id} className="rounded-xl bg-zinc-50 px-3 py-2">
                <p className="font-medium">{a.summary}</p>
                <p className="text-xs text-zinc-500">{new Date(a.at).toLocaleString()}</p>
                <p className="truncate text-xs text-zinc-400">{a.userAgent}</p>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold">Blocked</h2>
        <PrivacyNote variant="block" className="mt-3" />
        <ul className="mt-4 space-y-2 text-sm">
          {blocks.length === 0 ? (
            <li className="text-zinc-500">You have not blocked anyone.</li>
          ) : (
            blocks.map((b) => (
              <li key={b.key} className="flex items-center justify-between gap-2 rounded-xl bg-zinc-50 px-3 py-2">
                <div>
                  <p className="font-medium">{b.label}</p>
                  <p className="text-xs text-zinc-500">{b.reason || b.key}</p>
                </div>
                <button
                  type="button"
                  className="text-xs font-medium underline-offset-2 hover:underline"
                  onClick={() => {
                    unblockKey(b.key);
                    setTick((n) => n + 1);
                  }}
                >
                  Unblock
                </button>
              </li>
            ))
          )}
        </ul>
        {/* tick forces re-read */}
        <span className="hidden">{tick}</span>
      </section>

      <p className="mt-8 text-center text-sm text-zinc-500">
        <Link to="/privacy" className="underline-offset-2 hover:underline">
          Privacy center
        </Link>
        {" · "}
        <Link to="/" className="underline-offset-2 hover:underline">
          Home
        </Link>
      </p>
    </main>
  );
}
