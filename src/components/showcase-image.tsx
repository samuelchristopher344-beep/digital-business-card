import { useState } from "react";
import { RotateCcw } from "lucide-react";

type Props = {
  src: string;
  alt?: string;
  className?: string;
};

/** Showcase image with loading + retry. */
export function ShowcaseImage({ src, alt = "", className = "aspect-[3/4] w-full object-cover" }: Props) {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [attempt, setAttempt] = useState(0);

  if (!src) {
    return <div className="aspect-[3/4] w-full bg-card-line/40" />;
  }

  if (status === "error") {
    return (
      <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 bg-card-line/30 px-2">
        <p className="text-center text-[10px] text-card-mute">Couldn't load</p>
        <button
          type="button"
          onClick={() => {
            setStatus("loading");
            setAttempt((n) => n + 1);
          }}
          className="inline-flex items-center gap-1 rounded-full border border-card-line bg-paper px-2 py-1 text-[10px] text-card-fg"
        >
          <RotateCcw className="size-3" aria-hidden="true" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative aspect-[3/4] w-full">
      {status === "loading" ? (
        <div className="absolute inset-0 animate-pulse bg-card-line/40" aria-hidden="true" />
      ) : null}
      <img
        key={`${src}-${attempt}`}
        src={attempt > 0 ? `${src}${src.includes("?") ? "&" : "?"}r=${attempt}` : src}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        className={className + (status === "loading" ? " opacity-0" : " opacity-100") + " transition-opacity"}
        onLoad={() => setStatus("ok")}
        onError={() => setStatus("error")}
      />
    </div>
  );
}
