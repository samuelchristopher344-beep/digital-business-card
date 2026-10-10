import { useEffect, useState } from "react";
import { toString } from "qrcode";

/**
 * QR must stay high-contrast in every theme.
 * Never use transparent "light" modules or theme-tinted backgrounds —
 * dark mode made cream dark and the code disappeared.
 */
export function QrMark({ value, label }: { value: string; label: string }) {
  const [svg, setSvg] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    toString(value, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
      color: {
        dark: "#111111",
        light: "#ffffff",
      },
    })
      .then((markup) => {
        if (!cancelled) setSvg(markup);
      })
      .catch(() => {
        if (!cancelled) {
          setSvg("");
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  return (
    <div className="grid place-items-center rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-600">
      {failed ? (
        <p className="px-4 text-center text-sm leading-relaxed text-zinc-600">
          This code is too long to scan. Shorten the note or a link.
        </p>
      ) : svg ? (
        <div
          className="qr-svg aspect-square w-full max-w-44 [&_svg]:h-full [&_svg]:w-full"
          role="img"
          aria-label={label}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div
          className="aspect-square w-full max-w-44 animate-pulse rounded-lg bg-zinc-100"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
