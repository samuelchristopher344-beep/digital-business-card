import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  eventHeadline,
  msRemaining,
  readEventMode,
  startEventMode,
  stopEventMode,
  type EventDurationUnit,
} from "@/lib/event-mode";

export const Route = createFileRoute("/event-mode")({ component: EventModePage });

function EventModePage() {
  const [state, setState] = useState(() => readEventMode());
  const [title, setTitle] = useState(state.title || "");
  const [hashtag, setHashtag] = useState(state.hashtag || "");
  const [booth, setBooth] = useState(state.booth || "");
  const [durationValue, setDurationValue] = useState(state.durationValue || 3);
  const [durationUnit, setDurationUnit] = useState<EventDurationUnit>(state.durationUnit || "days");

  const remaining = msRemaining(state);
  const hoursLeft = Math.ceil(remaining / (60 * 60 * 1000));

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-10">
      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Event</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Event mode</h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        Temporary overrides for conferences and meetups. You choose how long it lasts (days, weeks,
        or months). When time is up, event mode turns off automatically on this device.
      </p>

      {state.enabled ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
          <p className="font-semibold">Event mode is on</p>
          <p className="mt-1">{eventHeadline(state)}</p>
          <p className="mt-2 text-xs">
            Ends {state.endsAt ? new Date(state.endsAt).toLocaleString() : "—"}
            {remaining > 0 ? ` · ~${hoursLeft}h left` : " · expired"}
          </p>
          <button
            type="button"
            className="mt-4 h-11 w-full rounded-xl bg-zinc-900 text-sm font-medium text-white"
            onClick={() => setState(stopEventMode())}
          >
            Turn off now
          </button>
        </div>
      ) : (
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setState(
              startEventMode({ title, hashtag, booth, durationValue, durationUnit }),
            );
          }}
        >
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Event title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Web Summit / local meetup"
              className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm"
            />
          </label>
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Hashtag (optional)
            <input
              value={hashtag}
              onChange={(e) => setHashtag(e.target.value.replace(/^#/, ""))}
              placeholder="WebSummit2026"
              className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm"
            />
          </label>
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Booth / stand (optional)
            <input
              value={booth}
              onChange={(e) => setBooth(e.target.value)}
              placeholder="12"
              className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Duration
              <input
                type="number"
                min={1}
                max={365}
                value={durationValue}
                onChange={(e) => setDurationValue(Number(e.target.value) || 1)}
                className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm"
              />
            </label>
            <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Unit
              <select
                value={durationUnit}
                onChange={(e) => setDurationUnit(e.target.value as EventDurationUnit)}
                className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </label>
          </div>
          <p className="text-xs text-zinc-500">
            Technically: we store an end timestamp and auto-disable when it passes. You can stop
            early anytime. No GPS is used.
          </p>
          <button type="submit" className="h-11 rounded-xl bg-zinc-900 text-sm font-medium text-white">
            Start event mode
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-zinc-500">
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
