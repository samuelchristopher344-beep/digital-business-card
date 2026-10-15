import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  MAX_CARDS,
  createCard,
  getActiveCardId,
  listCards,
  setActiveCard,
  type StoredCard,
} from "@/lib/multi-card";

type Props = {
  /** Called after switch so parent can reload profile */
  onSwitch?: (card: StoredCard) => void;
};

export function CardSwitcher({ onSwitch }: Props) {
  const [tick, setTick] = useState(0);
  void tick;
  const cards = listCards();
  const active = getActiveCardId();

  if (cards.length === 0) return null;

  return (
    <div className="rounded-card border border-line bg-cream p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-mute uppercase">Active card</p>
        <Link to="/cards" className="text-xs font-medium text-accent underline-offset-2 hover:underline">
          Manage all
        </Link>
      </div>
      <div
        className="mt-2 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Switch card"
      >
        {cards.map((c) => {
          const selected = c.id === active;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => {
                setActiveCard(c.id);
                setTick((n) => n + 1);
                onSwitch?.(c);
              }}
              className={
                "inline-flex h-10 shrink-0 items-center rounded-full border px-3 text-sm " +
                (selected
                  ? "border-ink bg-ink font-medium text-cream"
                  : "border-line bg-paper text-mute")
              }
            >
              {c.label || c.profile.fullName || "Card"}
            </button>
          );
        })}
        {cards.length < MAX_CARDS ? (
          <button
            type="button"
            onClick={() => {
              const label = window.prompt("Label (e.g. Work, Personal, Event)", "New card");
              if (label == null) return;
              const created = createCard(label.trim() || "New card");
              if (created) {
                setTick((n) => n + 1);
                onSwitch?.(created);
              }
            }}
            className="inline-flex h-10 shrink-0 items-center rounded-full border border-dashed border-line px-3 text-sm text-mute"
          >
            + Add
          </button>
        ) : null}
      </div>
      <p className="mt-1.5 text-[11px] text-mute">
        Work, personal, or event — switch which card you share. Stored on this device.
      </p>
    </div>
  );
}
