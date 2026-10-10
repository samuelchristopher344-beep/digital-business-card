import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  MAX_CARDS,
  createCard,
  deleteCard,
  getActiveCardId,
  listCards,
  renameCard,
  setActiveCard,
} from "@/lib/multi-card";

export const Route = createFileRoute("/cards")({ component: CardsPage });

function CardsPage() {
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const cards = listCards();
  const active = getActiveCardId();
  void tick;

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-10">
      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Identity</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your cards</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Up to {MAX_CARDS} cards (work, side project, event…). Switch which one you share. Stored on
        this device.
      </p>

      <ul className="mt-8 space-y-3">
        {cards.map((c) => (
          <li
            key={c.id}
            className={
              "rounded-2xl border p-4 " +
              (c.id === active
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900")
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{c.label || "Card"}</p>
                <p className="mt-0.5 text-sm opacity-80">
                  {c.profile.fullName || "Untitled"}
                  {c.profile.role ? ` · ${c.profile.role}` : ""}
                </p>
                {c.id === active ? (
                  <p className="mt-1 text-xs opacity-70">Active — used for share & edit</p>
                ) : null}
              </div>
              <div className="flex flex-col gap-1 text-xs font-medium">
                {c.id !== active ? (
                  <button
                    type="button"
                    className="underline-offset-2 hover:underline"
                    onClick={() => {
                      setActiveCard(c.id);
                      setTick((n) => n + 1);
                    }}
                  >
                    Use this
                  </button>
                ) : null}
                <button
                  type="button"
                  className="underline-offset-2 hover:underline"
                  onClick={() => {
                    setActiveCard(c.id);
                    void navigate({ to: "/edit" });
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="underline-offset-2 hover:underline"
                  onClick={() => {
                    const label = prompt("Label for this card", c.label);
                    if (label != null) {
                      renameCard(c.id, label.trim() || c.label);
                      setTick((n) => n + 1);
                    }
                  }}
                >
                  Rename
                </button>
                {cards.length > 1 ? (
                  <button
                    type="button"
                    className="text-red-600 underline-offset-2 hover:underline dark:text-red-400"
                    onClick={() => {
                      if (confirm("Delete this card from this device?")) {
                        deleteCard(c.id);
                        setTick((n) => n + 1);
                      }
                    }}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={cards.length >= MAX_CARDS}
        className="mt-6 h-12 w-full rounded-full bg-zinc-900 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
        onClick={() => {
          const label = prompt("Label (e.g. Work, Founder, Event)", "New card");
          if (label == null) return;
          const created = createCard(label.trim() || "New card");
          if (!created) {
            alert(`Limit is ${MAX_CARDS} cards on free local store.`);
            return;
          }
          setTick((n) => n + 1);
          void navigate({ to: "/edit" });
        }}
      >
        {cards.length >= MAX_CARDS ? `Limit ${MAX_CARDS} cards` : "Add another card"}
      </button>

      <p className="mt-8 text-center text-sm text-zinc-500">
        <Link to="/edit" className="underline-offset-2 hover:underline">
          Edit active
        </Link>
        {" · "}
        <Link to="/" className="underline-offset-2 hover:underline">
          Home
        </Link>
      </p>
    </main>
  );
}
