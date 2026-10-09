import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PrivacyNote } from "@/components/privacy-note";
import {
  ADDRESS_COUNTRIES,
  defaultSettings,
  patchSettings,
  readSettings,
  type AppSettings,
  type DefaultTag,
  type ThemePref,
} from "@/lib/app-settings";
import type { CountryCode } from "@/lib/address-countries";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const [s, setS] = useState<AppSettings>(() => defaultSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setS(readSettings());
  }, []);

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    const next = patchSettings({ [key]: value });
    setS(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Controls for privacy, notifications, and appearance. Private data stays on this device
          unless you save a card to your account.
        </p>
        {saved ? (
          <p className="mt-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">Saved</p>
        ) : null}

        <Section title="Appearance">
          <Label>Theme</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["system", "light", "dark"] as ThemePref[]).map((t) => (
              <Chip key={t} active={s.theme === t} onClick={() => update("theme", t)}>
                {t}
              </Chip>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-500">You can also use the moon/sun toggle on the top right.</p>
        </Section>

        <Section title="Privacy & visibility">
          <PrivacyNote className="mb-3" />
          <Toggle
            label="Keep card unlisted until I publish"
            checked={s.cardUnlistedUntilPublish}
            onChange={(v) => update("cardUnlistedUntilPublish", v)}
          />
          <Toggle
            label="Show email on public card"
            checked={s.showEmailOnCard}
            onChange={(v) => update("showEmailOnCard", v)}
            hint="Default off to reduce spam."
          />
          <Toggle
            label="Show phone on public card"
            checked={s.showPhoneOnCard}
            onChange={(v) => update("showPhoneOnCard", v)}
            hint="Default off."
          />
          <Toggle
            label="Show address on public card"
            checked={s.showAddressOnCard}
            onChange={(v) => update("showAddressOnCard", v)}
          />
          <Toggle
            label="Allow search engines to index my card"
            checked={s.allowSearchIndexing}
            onChange={(v) => update("allowSearchIndexing", v)}
          />
          <Label className="mt-4">Address country format</Label>
          <p className="mt-1 text-xs text-zinc-500">You choose this — we do not use GPS.</p>
          <select
            value={s.addressCountry}
            onChange={(e) => update("addressCountry", e.target.value as CountryCode)}
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {ADDRESS_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </Section>

        <Section title="Notifications">
          <Toggle
            label="Login alerts on this device"
            checked={s.loginAlerts}
            onChange={(v) => update("loginAlerts", v)}
          />
          <Toggle
            label="Remind me before event mode ends"
            checked={s.eventExpiryReminder}
            onChange={(v) => update("eventExpiryReminder", v)}
          />
          <Toggle
            label="Weekly insights email"
            checked={s.weeklyInsightsEmail}
            onChange={(v) => update("weeklyInsightsEmail", v)}
            hint="Off by default."
          />
          <Toggle
            label="Card birthday note"
            checked={s.cardBirthdayNote}
            onChange={(v) => update("cardBirthdayNote", v)}
            hint="Quiet in-app only when enabled."
          />
        </Section>

        <Section title="Event & availability">
          <Label>Default event duration (days)</Label>
          <input
            type="number"
            min={1}
            max={365}
            value={s.defaultEventDays}
            onChange={(e) => update("defaultEventDays", Math.max(1, Number(e.target.value) || 3))}
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <Label className="mt-4">Default “free to chat” minutes</Label>
          <input
            type="number"
            min={5}
            max={120}
            value={s.freeToChatMinutes}
            onChange={(e) =>
              update("freeToChatMinutes", Math.min(120, Math.max(5, Number(e.target.value) || 15)))
            }
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <p className="mt-3 text-sm">
            <Link to="/event-mode" className="font-medium underline-offset-2 hover:underline">
              Open event mode
            </Link>
            {" · "}
            <Link to="/availability" className="font-medium underline-offset-2 hover:underline">
              Free to chat
            </Link>
          </p>
        </Section>

        <Section title="Insights">
          <PrivacyNote variant="anonymousStats" className="mb-3" />
          <Toggle
            label="Count views, shares, and saves (anonymous)"
            checked={s.insightsEnabled}
            onChange={(v) => update("insightsEnabled", v)}
          />
          <p className="mt-2 text-sm">
            <Link to="/insights" className="font-medium underline-offset-2 hover:underline">
              View insights
            </Link>
          </p>
        </Section>

        <Section title="Sharing">
          <Label>Default QR mode</Label>
          <div className="mt-2 flex gap-2">
            <Chip
              active={s.defaultQrMode === "card"}
              onClick={() => update("defaultQrMode", "card")}
            >
              Open card
            </Chip>
            <Chip
              active={s.defaultQrMode === "contact"}
              onClick={() => update("defaultQrMode", "contact")}
            >
              Save contact
            </Chip>
          </div>
          <Toggle
            label="Suggest follow-up message after scan"
            checked={s.autoMessageAfterScan}
            onChange={(v) => update("autoMessageAfterScan", v)}
            hint="Never auto-sends. You always confirm."
          />
        </Section>

        <Section title="Contacts notebook">
          <PrivacyNote className="mb-3" />
          <Label>Default tag after scan</Label>
          <select
            value={s.defaultContactTag}
            onChange={(e) => update("defaultContactTag", e.target.value as DefaultTag)}
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="client">Client</option>
            <option value="peer">Peer</option>
            <option value="hire">Hiring / job</option>
            <option value="friend">Friend</option>
            <option value="partner">Partner</option>
            <option value="vendor">Vendor</option>
            <option value="investor">Investor</option>
            <option value="other">Other</option>
          </select>
          <p className="mt-3 text-sm">
            <Link to="/contacts" className="font-medium underline-offset-2 hover:underline">
              Open private contacts
            </Link>
          </p>
        </Section>

        <Section title="Security & data">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <Link to="/security" className="font-medium underline-offset-2 hover:underline">
              Login alerts & block list
            </Link>
          </p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            <Link to="/privacy" className="font-medium underline-offset-2 hover:underline">
              Privacy center
            </Link>
          </p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            <Link to="/forgot-password" className="font-medium underline-offset-2 hover:underline">
              Forgot password
            </Link>
          </p>
          <button
            type="button"
            className="mt-4 h-11 w-full rounded-xl border border-red-200 text-sm font-medium text-red-800 dark:border-red-900 dark:text-red-300"
            onClick={() => {
              if (
                !confirm(
                  "Clear private local data on this device (notes, tags, blocks, local insights)? Your public card fields in this browser profile are not wiped by this button.",
                )
              )
                return;
              const keys = [
                "cc.privacy.contacts.v1",
                "cc.privacy.blocks.v1",
                "cc.privacy.reports.v1",
                "cc.privacy.login-alerts.v1",
                "cc.insights.v1",
              ];
              for (const k of keys) localStorage.removeItem(k);
              setSaved(true);
            }}
          >
            Clear local private data
          </button>
        </Section>

        <p className="mt-8 text-center text-sm text-zinc-500">
          <Link to="/" className="underline-offset-2 hover:underline">
            Home
          </Link>
        </p>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-xs font-medium uppercase tracking-wide text-zinc-500 ${className}`}>
      {children}
    </p>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="mt-3 flex cursor-pointer items-start justify-between gap-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-zinc-500">{hint}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={
          "relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors " +
          (checked ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700")
        }
      >
        <span
          className={
            "absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform dark:bg-zinc-900 " +
            (checked ? "left-5" : "left-0.5")
          }
        />
      </button>
    </label>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "h-9 rounded-full px-3 text-xs font-medium capitalize " +
        (active
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200")
      }
    >
      {children}
    </button>
  );
}
