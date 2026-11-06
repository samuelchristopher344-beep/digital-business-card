import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, MessageCircle, Smartphone } from "lucide-react";
import { PrivacyNote } from "@/components/privacy-note";
import { TopBar } from "@/components/top-bar";
import {
  CONTACT_TAGS,
  deletePrivateContact,
  listPrivateContacts,
  type ContactTagId,
  type PrivateContact,
  upsertPrivateContact,
} from "@/lib/privacy-vault";
import {
  addFollowUp,
  buildFollowUpText,
  deleteFollowUp,
  followUpTemplates,
  listDueFollowUps,
  listOpenFollowUps,
  markFollowUpDone,
  pollDueFollowUps,
  requestNotificationPermission,
  smsUrl,
  whatsappUrl,
  type FollowUp,
  type FollowUpChannel,
} from "@/lib/follow-ups";
import { readStoredProfile, publicCardUrl } from "@/lib/profile";

export const Route = createFileRoute("/contacts")({ component: ContactsPage });

function ContactsPage() {
  const [tick, setTick] = useState(0);
  const contacts = useMemo(() => listPrivateContacts(), [tick]);
  const followUps = useMemo(() => listOpenFollowUps(), [tick]);
  const due = useMemo(() => listDueFollowUps(), [tick]);
  const [filter, setFilter] = useState<ContactTagId | "all">("all");
  const [editing, setEditing] = useState<PrivateContact | null>(null);
  const [scheduleFor, setScheduleFor] = useState<PrivateContact | null>(null);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPerm("unsupported");
      return;
    }
    setPerm(Notification.permission);
    pollDueFollowUps();
    const id = window.setInterval(() => {
      pollDueFollowUps();
      setTick((n) => n + 1);
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const shown = contacts.filter((c) => filter === "all" || c.tag === filter);

  async function enableAlerts() {
    const p = await requestNotificationPermission();
    setPerm(p);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <TopBar title="Calling Card" />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Connections</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          People I met
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Save people from cards you scan, then schedule a follow-up. At the time, we remind you and
          open WhatsApp or SMS with a draft — you tap Send.
        </p>
        <PrivacyNote className="mt-4" />

        {perm !== "granted" && perm !== "unsupported" ? (
          <button
            type="button"
            onClick={() => void enableAlerts()}
            className="mt-4 inline-flex h-11 items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <Bell className="size-4" /> Enable follow-up alerts
          </button>
        ) : null}

        {due.length > 0 ? (
          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
            <h2 className="text-sm font-semibold text-amber-950 dark:text-amber-100">Due now</h2>
            <ul className="mt-3 space-y-3">
              {due.map((f) => (
                <FollowUpRow
                  key={f.id}
                  f={f}
                  highlight
                  onDone={() => {
                    markFollowUpDone(f.id);
                    setTick((n) => n + 1);
                  }}
                  onDelete={() => {
                    deleteFollowUp(f.id);
                    setTick((n) => n + 1);
                  }}
                />
              ))}
            </ul>
          </section>
        ) : null}

        {followUps.filter((f) => f.dueAt > Date.now()).length > 0 ? (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Upcoming</h2>
            <ul className="mt-3 space-y-3">
              {followUps
                .filter((f) => f.dueAt > Date.now())
                .map((f) => (
                  <FollowUpRow
                    key={f.id}
                    f={f}
                    onDone={() => {
                      markFollowUpDone(f.id);
                      setTick((n) => n + 1);
                    }}
                    onDelete={() => {
                      deleteFollowUp(f.id);
                      setTick((n) => n + 1);
                    }}
                  />
                ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-2">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterChip>
          {CONTACT_TAGS.map((t) => (
            <FilterChip key={t.id} active={filter === t.id} onClick={() => setFilter(t.id)}>
              {t.label}
            </FilterChip>
          ))}
        </div>

        <ul className="mt-6 space-y-3">
          {shown.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
              No connections yet. Open someone’s card →{" "}
              <strong>Save to my contacts</strong>, or{" "}
              <Link to="/scan" className="font-medium underline-offset-2 hover:underline">
                Scan QR
              </Link>
              .
            </li>
          ) : (
            shown.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {c.fullName || c.slug || "Contact"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {CONTACT_TAGS.find((t) => t.id === c.tag)?.label}
                      {c.metAt ? ` · ${c.metAt}` : ""}
                    </p>
                    {c.note ? (
                      <p className="mt-2 text-sm text-zinc-700 whitespace-pre-wrap dark:text-zinc-300">
                        {c.note}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col gap-1 text-right">
                    <button
                      type="button"
                      className="text-xs font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
                      onClick={() => setScheduleFor(c)}
                    >
                      Follow up
                    </button>
                    <button
                      type="button"
                      className="text-xs font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
                      onClick={() => setEditing(c)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-xs text-red-700 underline-offset-2 hover:underline"
                      onClick={() => {
                        deletePrivateContact(c.id);
                        setTick((n) => n + 1);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.link ? (
                    <a
                      href={c.link}
                      className="inline-flex h-9 items-center rounded-lg border border-zinc-200 px-3 text-xs font-medium dark:border-zinc-700"
                    >
                      Open card
                    </a>
                  ) : null}
                  {c.phone ? (
                    <a
                      href={whatsappUrl(
                        c.phone,
                        buildFollowUpText({
                          message: "Hi! Great connecting — here’s my card:",
                          link: myCardLink(),
                        }),
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center gap-1 rounded-lg bg-zinc-900 px-3 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                    >
                      <MessageCircle className="size-3.5" /> WhatsApp now
                    </a>
                  ) : null}
                </div>
              </li>
            ))
          )}
        </ul>

        {editing ? (
          <EditSheet
            contact={editing}
            onClose={() => setEditing(null)}
            onSave={(next) => {
              upsertPrivateContact(next);
              setEditing(null);
              setTick((n) => n + 1);
            }}
          />
        ) : null}

        {scheduleFor ? (
          <ScheduleSheet
            contact={scheduleFor}
            onClose={() => setScheduleFor(null)}
            onSave={() => {
              setScheduleFor(null);
              setTick((n) => n + 1);
            }}
          />
        ) : null}

        <p className="mt-8 text-center text-sm text-zinc-500">
          <Link to="/scan" className="underline-offset-2 hover:underline">
            Scan QR
          </Link>
          {" · "}
          <Link to="/privacy" className="underline-offset-2 hover:underline">
            Privacy
          </Link>
          {" · "}
          <Link to="/" className="underline-offset-2 hover:underline">
            Home
          </Link>
        </p>
      </main>
    </div>
  );
}

function myCardLink(): string {
  const p = readStoredProfile();
  if (!p) return typeof window !== "undefined" ? window.location.origin : "";
  return publicCardUrl(p);
}

function FollowUpRow({
  f,
  highlight,
  onDone,
  onDelete,
}: {
  f: FollowUp;
  highlight?: boolean;
  onDone: () => void;
  onDelete: () => void;
}) {
  const text = buildFollowUpText(f);
  const when = new Date(f.dueAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <li
      className={
        "rounded-xl border p-3 " +
        (highlight
          ? "border-amber-300 bg-white dark:border-amber-800 dark:bg-zinc-900"
          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900")
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-50">{f.name}</p>
          <p className="text-xs text-zinc-500">{when}</p>
          {f.message ? (
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{f.message}</p>
          ) : null}
        </div>
        <button type="button" onClick={onDelete} className="text-xs text-zinc-500 hover:underline">
          Remove
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(f.channel === "whatsapp" || f.channel === "remind") && (
          <a
            href={whatsappUrl(f.phone, text)}
            target="_blank"
            rel="noreferrer"
            onClick={onDone}
            className="inline-flex h-9 items-center gap-1 rounded-lg bg-zinc-900 px-3 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            <MessageCircle className="size-3.5" /> Open WhatsApp
          </a>
        )}
        {(f.channel === "sms" || f.channel === "remind") && (
          <a
            href={smsUrl(f.phone, text)}
            onClick={onDone}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-300 px-3 text-xs font-medium dark:border-zinc-600"
          >
            <Smartphone className="size-3.5" /> Open SMS
          </a>
        )}
        <button
          type="button"
          onClick={onDone}
          className="h-9 rounded-lg px-3 text-xs font-medium text-zinc-600 underline-offset-2 hover:underline"
        >
          Mark done
        </button>
      </div>
    </li>
  );
}

function FilterChip({
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
        "h-9 rounded-full px-3 text-xs font-medium " +
        (active
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300")
      }
    >
      {children}
    </button>
  );
}

function EditSheet({
  contact,
  onClose,
  onSave,
}: {
  contact: PrivateContact;
  onClose: () => void;
  onSave: (c: PrivateContact) => void;
}) {
  const [tag, setTag] = useState<ContactTagId>(contact.tag);
  const [note, setNote] = useState(contact.note);
  const [metAt, setMetAt] = useState(contact.metAt);
  const [phone, setPhone] = useState(contact.phone);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">Edit connection</h2>
        <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Tag
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value as ContactTagId)}
            className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            {CONTACT_TAGS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Phone (for WhatsApp / SMS)
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className="mt-3 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Met at
          <input
            value={metAt}
            onChange={(e) => setMetAt(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className="mt-3 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Note (only you)
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-xl border border-zinc-200 text-sm font-medium dark:border-zinc-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave({ ...contact, tag, note, metAt, phone })}
            className="h-11 flex-1 rounded-xl bg-zinc-900 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ScheduleSheet({
  contact,
  onClose,
  onSave,
}: {
  contact: PrivateContact;
  onClose: () => void;
  onSave: () => void;
}) {
  const templates = followUpTemplates();
  const [templateId, setTemplateId] = useState<string>(templates[0].id);
  const [message, setMessage] = useState(templates[0].body);
  const [channel, setChannel] = useState<FollowUpChannel>("whatsapp");
  const defaultDue = new Date(Date.now() + 24 * 60 * 60 * 1000);
  defaultDue.setMinutes(0, 0, 0);
  const [dueLocal, setDueLocal] = useState(
    defaultDue.toISOString().slice(0, 16),
  );

  function applyTemplate(id: string) {
    setTemplateId(id);
    const t = templates.find((x) => x.id === id);
    if (t) setMessage(t.body);
  }

  function submit() {
    const dueAt = new Date(dueLocal).getTime();
    if (!Number.isFinite(dueAt) || dueAt < Date.now() - 60_000) {
      alert("Pick a time in the future");
      return;
    }
    void requestNotificationPermission();
    addFollowUp({
      contactId: contact.id,
      name: contact.fullName || contact.slug,
      phone: contact.phone,
      link: myCardLink() || contact.link,
      message,
      channel,
      dueAt,
    });
    onSave();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">Schedule follow-up</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          For <strong>{contact.fullName || contact.slug}</strong>. We’ll remind you; you send the
          message.
        </p>

        <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          When
          <input
            type="datetime-local"
            value={dueLocal}
            onChange={(e) => setDueLocal(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>

        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Template</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyTemplate(t.id)}
              className={
                "h-9 rounded-full px-3 text-xs font-medium " +
                (templateId === t.id
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-200 dark:border-zinc-700")
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <label className="mt-3 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Message
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={500}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <p className="mt-1 text-xs text-zinc-500">Your card link is added automatically when you open chat.</p>

        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Prefer</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {(
            [
              ["whatsapp", "WhatsApp"],
              ["sms", "SMS"],
              ["remind", "Remind only"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setChannel(id)}
              className={
                "h-9 rounded-full px-3 text-xs font-medium " +
                (channel === id
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-200 dark:border-zinc-700")
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-xl border border-zinc-200 text-sm font-medium dark:border-zinc-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="h-11 flex-1 rounded-xl bg-zinc-900 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
