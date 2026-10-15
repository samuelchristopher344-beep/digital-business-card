import { Lightbulb, X } from "lucide-react";
import type { Profile } from "@/lib/profile";

const DISMISS_KEY = "cc.tips.dismissed.v1";

function readDismissed(): string[] {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function dismiss(id: string) {
  const next = [...new Set([...readDismissed(), id])];
  localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
}

export type Tip = {
  id: string;
  title: string;
  body: string;
  applyLabel?: string;
};

export function buildTips(profile: Profile): Tip[] {
  const tips: Tip[] = [];
  const hasContact =
    Boolean(profile.whatsapp?.trim() || profile.phone?.trim() || profile.email?.trim());
  if (hasContact && !profile.scanMessage?.trim()) {
    tips.push({
      id: "scan-message",
      title: "Add a message after scan",
      body: "A short line people see when they open your card — e.g. “WhatsApp me for prices.” Optional and written by you only.",
      applyLabel: "Add message",
    });
  }
  if (
    (profile.showcase ?? []).length === 0 &&
    (profile.cardType === "business" ||
      profile.cardType === "creator" ||
      profile.cardType === "company")
  ) {
    tips.push({
      id: "showcase",
      title: "Show what you do",
      body: "Add a Showcase line — we build a look from your words so the card proves your work.",
      applyLabel: "Go to Showcase",
    });
  }
  if (!profile.fullName?.trim()) {
    tips.push({
      id: "name",
      title: "Add your name",
      body: "The name is the first thing people see. Keep it clear.",
    });
  }
  return tips;
}

type Props = {
  profile: Profile;
  onApply?: (tipId: string) => void;
  onChange?: () => void;
};

export function CardTips({ profile, onApply, onChange }: Props) {
  const dismissed = typeof window !== "undefined" ? readDismissed() : [];
  const tips = buildTips(profile).filter((t) => !dismissed.includes(t.id));
  if (tips.length === 0) return null;

  return (
    <section className="rounded-card border border-line bg-cream p-4 sm:p-5" aria-label="Suggestions">
      <div className="flex items-center gap-2">
        <Lightbulb className="size-4 text-accent" aria-hidden="true" />
        <h2 className="text-sm font-medium text-ink">Suggestions for your card</h2>
      </div>
      <ul className="mt-3 space-y-3">
        {tips.map((tip) => (
          <li key={tip.id} className="rounded-xl border border-line bg-paper p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{tip.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-mute">{tip.body}</p>
              </div>
              <button
                type="button"
                aria-label={`Dismiss ${tip.title}`}
                onClick={() => {
                  dismiss(tip.id);
                  onChange?.();
                }}
                className="shrink-0 rounded-lg p-1 text-mute hover:text-ink"
              >
                <X className="size-3.5" />
              </button>
            </div>
            {tip.applyLabel && onApply ? (
              <button
                type="button"
                onClick={() => onApply(tip.id)}
                className="mt-2 text-xs font-medium text-accent underline-offset-2 hover:underline"
              >
                {tip.applyLabel}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] text-mute">
        Tips stay on this device. Nothing is sent to other people until you share your card.
      </p>
    </section>
  );
}
