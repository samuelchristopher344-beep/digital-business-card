/**
 * Scheduled follow-ups — stored only on this device.
 * At due time we notify and offer WhatsApp/SMS with a pre-filled draft (user taps Send).
 */

export type FollowUpChannel = "remind" | "whatsapp" | "sms";

export type FollowUp = {
  id: string;
  /** Links to private contact id when known */
  contactId: string;
  name: string;
  phone: string;
  link: string;
  message: string;
  channel: FollowUpChannel;
  /** Unix ms when reminder should fire */
  dueAt: number;
  done: boolean;
  createdAt: number;
};

const KEY = "cc.follow-ups.v1";

const TEMPLATES = [
  {
    id: "thanks",
    label: "Thanks for meeting",
    body: "Great meeting you! Here’s my card if useful:",
  },
  {
    id: "card",
    label: "Sending my card",
    body: "Sharing my digital business card — easy way to stay in touch:",
  },
  {
    id: "call",
    label: "About our call",
    body: "Following up on our conversation. My card is here if you need anything:",
  },
  {
    id: "blank",
    label: "Custom",
    body: "",
  },
] as const;

export function followUpTemplates() {
  return TEMPLATES;
}

function readAll(): FollowUp[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FollowUp[];
  } catch {
    return [];
  }
}

function writeAll(rows: FollowUp[]) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function listFollowUps(): FollowUp[] {
  return readAll().sort((a, b) => a.dueAt - b.dueAt);
}

export function listOpenFollowUps(): FollowUp[] {
  return listFollowUps().filter((f) => !f.done);
}

export function listDueFollowUps(now = Date.now()): FollowUp[] {
  return listOpenFollowUps().filter((f) => f.dueAt <= now);
}

export function addFollowUp(input: {
  contactId?: string;
  name: string;
  phone?: string;
  link?: string;
  message: string;
  channel: FollowUpChannel;
  dueAt: number;
}): FollowUp {
  const row: FollowUp = {
    id: crypto.randomUUID(),
    contactId: input.contactId || "",
    name: input.name.trim() || "Contact",
    phone: (input.phone || "").trim(),
    link: (input.link || "").trim(),
    message: input.message.trim().slice(0, 500),
    channel: input.channel,
    dueAt: input.dueAt,
    done: false,
    createdAt: Date.now(),
  };
  writeAll([row, ...readAll()]);
  return row;
}

export function markFollowUpDone(id: string) {
  writeAll(readAll().map((f) => (f.id === id ? { ...f, done: true } : f)));
}

export function deleteFollowUp(id: string) {
  writeAll(readAll().filter((f) => f.id !== id));
}

/** Full draft text including optional card link. */
export function buildFollowUpText(f: Pick<FollowUp, "message" | "link">): string {
  const parts = [f.message.trim(), f.link.trim()].filter(Boolean);
  return parts.join("\n\n");
}

export function whatsappUrl(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  const q = encodeURIComponent(text);
  if (digits) return `https://wa.me/${digits}?text=${q}`;
  return `https://wa.me/?text=${q}`;
}

export function smsUrl(phone: string, text: string): string {
  const body = encodeURIComponent(text);
  const num = phone.replace(/\s/g, "");
  // iOS uses &body=, Android often ?body=
  if (num) return `sms:${num}?body=${body}`;
  return `sms:?body=${body}`;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function showFollowUpNotification(f: FollowUp) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    const n = new Notification(`Follow up: ${f.name}`, {
      body: f.message.slice(0, 120) || "Time to message them — open Calling Card.",
      tag: `cc-followup-${f.id}`,
    });
    n.onclick = () => {
      window.focus();
      window.location.href = "/contacts";
      n.close();
    };
  } catch {
    // ignore
  }
}

/** Call once on app load — fires notifications for due items (best-effort while tab is open). */
export function pollDueFollowUps() {
  if (typeof window === "undefined") return;
  const due = listDueFollowUps();
  for (const f of due) {
    const flagKey = `cc.followup.notified.${f.id}`;
    if (sessionStorage.getItem(flagKey)) continue;
    showFollowUpNotification(f);
    sessionStorage.setItem(flagKey, "1");
  }
}
