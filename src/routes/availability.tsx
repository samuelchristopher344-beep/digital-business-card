import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { goAvailable, goOffline, readAvailability } from "@/lib/availability";

export const Route = createFileRoute("/availability")({ component: AvailabilityPage });

function AvailabilityPage() {
  const [state, setState] = useState(() => readAvailability());
  const [minutes, setMinutes] = useState(15);
  const [message, setMessage] = useState("Free to chat");

  useEffect(() => {
    if (!state.active || !state.endsAt) return;
    const id = window.setInterval(() => {
      setState(readAvailability());
    }, 15_000);
    return () => window.clearInterval(id);
  }, [state.active, state.endsAt]);

  const left =
    state.active && state.endsAt
      ? Math.max(0, Math.ceil((new Date(state.endsAt).getTime() - Date.now()) / 60000))
      : 0;

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-10">
      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Presence</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Free to chat</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Opt-in status with a hard timer (default 15 minutes). It turns off automatically — you are
        never stuck “available.”
      </p>

      {state.active ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-950">{state.message}</p>
          <p className="mt-1 text-xs text-emerald-900">About {left} min left</p>
          <button
            type="button"
            className="mt-4 h-11 w-full rounded-xl bg-zinc-900 text-sm font-medium text-white"
            onClick={() => setState(goOffline())}
          >
            Turn off now
          </button>
        </div>
      ) : (
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setState(goAvailable(minutes, message));
          }}
        >
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Message
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={80}
              className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm"
            />
          </label>
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Minutes (5–120)
            <input
              type="number"
              min={5}
              max={120}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value) || 15)}
              className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm"
            />
          </label>
          <button type="submit" className="h-11 rounded-xl bg-zinc-900 text-sm font-medium text-white">
            I’m free to chat
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
