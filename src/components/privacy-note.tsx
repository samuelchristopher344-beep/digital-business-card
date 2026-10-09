import { Lock } from "lucide-react";
import { PRIVACY_COPY } from "@/lib/privacy-vault";

export function PrivacyNote({
  variant = "onlyYou",
  className = "",
}: {
  variant?: keyof typeof PRIVACY_COPY;
  className?: string;
}) {
  return (
    <p
      className={
        "inline-flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-emerald-950 " +
        className
      }
    >
      <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>
        <strong className="font-semibold">Private. </strong>
        {PRIVACY_COPY[variant]}
      </span>
    </p>
  );
}
