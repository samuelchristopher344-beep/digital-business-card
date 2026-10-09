/** Opt-in “free to chat” status with hard auto-off timer. */

export type AvailabilityState = {
  active: boolean;
  message: string;
  endsAt: string | null;
  minutes: number;
};

const KEY = "cc.availability.v1";

export function defaultAvailability(): AvailabilityState {
  return { active: false, message: "Free to chat for a bit", endsAt: null, minutes: 15 };
}

export function readAvailability(): AvailabilityState {
  if (typeof window === "undefined") return defaultAvailability();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultAvailability();
    const parsed = { ...defaultAvailability(), ...(JSON.parse(raw) as AvailabilityState) };
    if (parsed.active && parsed.endsAt && new Date(parsed.endsAt).getTime() < Date.now()) {
      const off = { ...parsed, active: false, endsAt: null };
      localStorage.setItem(KEY, JSON.stringify(off));
      return off;
    }
    return parsed;
  } catch {
    return defaultAvailability();
  }
}

export function goAvailable(minutes: number, message?: string): AvailabilityState {
  const mins = Math.min(120, Math.max(5, minutes));
  const endsAt = new Date(Date.now() + mins * 60 * 1000).toISOString();
  const state: AvailabilityState = {
    active: true,
    message: (message || "Free to chat").slice(0, 80),
    endsAt,
    minutes: mins,
  };
  localStorage.setItem(KEY, JSON.stringify(state));
  return state;
}

export function goOffline(): AvailabilityState {
  const state = { ...defaultAvailability(), active: false };
  localStorage.setItem(KEY, JSON.stringify(state));
  return state;
}
