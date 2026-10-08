import { useEffect, useState } from "react";
import { toString } from "qrcode";

export function QrMark({ value, label }: { value: string; label: string }) {
  const [svg, setSvg] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    toString(value, {
      type: "svg",
      margin: 0,
      errorCorrectionLevel: "M",
      color: { dark: "#161411", light: "#00000000" },
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
    <div className="grid place-items-center rounded-2xl bg-cream p-4">
      {failed ? (
        <p className="px-4 text-center text-sm leading-relaxed text-mute">
          This code is too long to scan. Shorten the note or a link.
        </p>
      ) : svg ? (
        <div
          className="qr-svg aspect-square w-full max-w-44"
          role="img"
          aria-label={label}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="aspect-square w-full max-w-44 rounded-lg bg-paper-deep" aria-hidden="true" />
      )}
    </div>
  );
}
