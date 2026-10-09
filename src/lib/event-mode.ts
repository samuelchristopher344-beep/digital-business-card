/**
 * Event mode — temporary overrides on YOUR card.
 * Expiry is enforced on this device; public hash links still show whatever was shared
 * unless the viewer loads a server card that you update.
 */

export type EventDurationUnit = "days" | "weeks" | "months";

export type EventModeState = {
  enabled: boolean;
  title: string;
  hashtag: string;
  booth: string;
  /** ISO end time */
  endsAt: string | null;
  durationValue: number;
  durationUnit: EventDurationUnit;
  startedAt: string | null;
};

const KEY = "cc.event-mode.v1";

export function defaultEventMode(): EventModeState {
  return {
    enabled: false,
    title: "",
    hashtag: "",
    booth: "",
    endsAt: null,
    durationValue: 3,
    durationUnit: "days",
    startedAt: null,
  };
}

export function readEventMode(): EventModeState {
  if (typeof window === "undefined") return defaultEventMode();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultEventMode();
    const parsed = { ...defaultEventMode(), ...(JSON.parse(raw) as EventModeState) };
    if (parsed.enabled && parsed.endsAt && new Date(parsed.endsAt).getTime() < Date.now()) {
      // Auto-expire
      const expired = { ...parsed, enabled: false };
      localStorage.setItem(KEY, JSON.stringify(expired));
      return expired;
    }
    return parsed;
  } catch {
    return defaultEventMode();
  }
}

export function writeEventMode(state: EventModeState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function computeEndsAt(value: number, unit: EventDurationUnit, from = new Date()): string {
  const d = new Date(from);
  if (unit === "days") d.setDate(d.getDate() + value);
  else if (unit === "weeks") d.setDate(d.getDate() + value * 7);
  else d.setMonth(d.getMonth() + value);
  return d.toISOString();
}

export function startEventMode(
  partial: Pick<EventModeState, "title" | "hashtag" | "booth" | "durationValue" | "durationUnit">,
): EventModeState {
  const startedAt = new Date().toISOString();
  const state: EventModeState = {
    enabled: true,
    title: partial.title.trim(),
    hashtag: partial.hashtag.trim().replace(/^#/, ""),
    booth: partial.booth.trim(),
    durationValue: Math.max(1, Math.min(365, partial.durationValue || 1)),
    durationUnit: partial.durationUnit,
    startedAt,
    endsAt: computeEndsAt(partial.durationValue, partial.durationUnit, new Date(startedAt)),
  };
  writeEventMode(state);
  return state;
}

export function stopEventMode(): EventModeState {
  const cur = readEventMode();
  const next = { ...cur, enabled: false };
  writeEventMode(next);
  return next;
}

export function eventHeadline(state: EventModeState): string | null {
  if (!state.enabled) return null;
  const parts = [
    state.title,
    state.hashtag ? `#${state.hashtag}` : "",
    state.booth ? `Booth ${state.booth}` : "",
  ].filter(Boolean);
  return parts.join(" · ") || "Event mode on";
}

export function msRemaining(state: EventModeState): number {
  if (!state.enabled || !state.endsAt) return 0;
  return Math.max(0, new Date(state.endsAt).getTime() - Date.now());
}
