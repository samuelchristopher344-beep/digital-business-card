import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PrivacyNote } from "@/components/privacy-note";
import {
  CONTACT_TAGS,
  deletePrivateContact,
  listPrivateContacts,
  type ContactTagId,
  type PrivateContact,
  upsertPrivateContact,
} from "@/lib/privacy-vault";

export const Route = createFileRoute("/contacts")({ component: ContactsPage });

function ContactsPage() {
  const [tick, setTick] = useState(0);
  const contacts = useMemo(() => listPrivateContacts(), [tick]);
  const [filter, setFilter] = useState<ContactTagId | "all">("all");
  const [editing, setEditing] = useState<PrivateContact | null>(null);

  const shown = contacts.filter((c) => filter === "all" || c.tag === filter);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Notebook</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">People I met</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Tags and notes after you scan or save someone. This is your private CRM-lite.
      </p>
      <PrivacyNote className="mt-4" />
      <PrivacyNote variant="notLinked" className="mt-2" />

      <div className="mt-6 flex flex-wrap gap-2">
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
          <li className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
            No private contacts yet. After you scan a card, you can save them here with a tag and
            note — only you will see it.
          </li>
        ) : (
          shown.map((c) => (
            <li key={c.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-900">{c.fullName || c.slug || "Contact"}</p>
                  <p className="text-xs text-zinc-500">
                    {CONTACT_TAGS.find((t) => t.id === c.tag)?.label}
                    {c.metAt ? ` · ${c.metAt}` : ""}
                  </p>
                  {c.note ? (
                    <p className="mt-2 text-sm text-zinc-700 whitespace-pre-wrap">{c.note}</p>
                  ) : (
                    <p className="mt-2 text-xs text-zinc-400">No private note</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    className="text-xs font-medium text-zinc-800 underline-offset-2 hover:underline"
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
              {c.link ? (
                <a
                  href={c.link}
                  className="mt-2 inline-block text-xs font-medium text-zinc-800 underline-offset-2 hover:underline"
                >
                  Open card
                </a>
              ) : null}
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

      <p className="mt-8 text-center text-sm text-zinc-500">
        <Link to="/privacy" className="underline-offset-2 hover:underline">
          Privacy center
        </Link>
        {" · "}
        <Link to="/scan" className="underline-offset-2 hover:underline">
          Scan QR
        </Link>
        {" · "}
        <Link to="/" className="underline-offset-2 hover:underline">
          Home
        </Link>
      </p>
    </main>
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
        (active ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-700")
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold">Private note</h2>
        <PrivacyNote className="mt-3" />
        <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Tag
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value as ContactTagId)}
            className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm"
          >
            {CONTACT_TAGS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Met at
          <input
            value={metAt}
            onChange={(e) => setMetAt(e.target.value)}
            placeholder="e.g. Web Summit booth 12"
            className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm"
          />
        </label>
        <label className="mt-3 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Note (only you)
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            maxLength={500}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-xl border border-zinc-200 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave({ ...contact, tag, note, metAt })}
            className="h-11 flex-1 rounded-xl bg-zinc-900 text-sm font-medium text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
