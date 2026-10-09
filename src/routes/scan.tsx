import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Camera, Loader2, ScanLine } from "lucide-react";
import { parseScannedQr, type ScanResult } from "@/lib/scan-qr";
import { encodeProfile, writeStoredProfile } from "@/lib/profile";

export const Route = createFileRoute("/scan")({ component: ScanPage });

async function requestCameraPermission(): Promise<MediaStream | null> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("This browser or WebView does not support camera access.");
  }
  // Explicit permission prompt before starting the scanner
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: "environment" } },
    audio: false,
  });
  return stream;
}

function ScanPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "starting" | "scanning" | "error">("idle");
  const [error, setError] = useState("");
  const [lastRaw, setLastRaw] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const previewStreamRef = useRef<MediaStream | null>(null);
  const handledRef = useRef(false);
  const readerId = "calling-card-qr-reader";

  const releasePreviewStream = useCallback(() => {
    const stream = previewStreamRef.current;
    previewStreamRef.current = null;
    if (stream) {
      for (const track of stream.getTracks()) track.stop();
    }
  }, []);

  const stopScanner = useCallback(async () => {
    const s = scannerRef.current;
    scannerRef.current = null;
    if (s) {
      try {
        await s.stop();
      } catch {
        // already stopped
      }
    }
    releasePreviewStream();
  }, [releasePreviewStream]);

  const handleDecoded = useCallback(
    async (text: string) => {
      if (handledRef.current) return;
      handledRef.current = true;
      setLastRaw(text);
      const parsed = parseScannedQr(text);
      setResult(parsed);
      await stopScanner();
      setStatus("idle");

      if (parsed.kind === "card-slug") {
        await navigate({ to: "/u/$slug", params: { slug: parsed.slug } });
        return;
      }

      if (parsed.kind === "card-hash") {
        writeStoredProfile(parsed.profile);
        const slug = parsed.profile.username || "card";
        const token = encodeProfile(parsed.profile);
        if (typeof window !== "undefined") {
          window.location.assign(`/u/${encodeURIComponent(slug)}#c=${token}`);
        }
        return;
      }
    },
    [navigate, stopScanner],
  );

  const startScanner = useCallback(async () => {
    setError("");
    setResult(null);
    setLastRaw("");
    handledRef.current = false;
    setStatus("starting");

    try {
      await stopScanner();

      // 1) Force the system permission dialog (browser + Capacitor WebView)
      try {
        const stream = await requestCameraPermission();
        previewStreamRef.current = stream;
        // Stop tracks so html5-qrcode can re-open the camera cleanly
        releasePreviewStream();
      } catch (permErr) {
        const msg = permErr instanceof Error ? permErr.message : String(permErr);
        if (/Permission|NotAllowed|denied|SecurityError/i.test(msg)) {
          throw new Error(
            "Camera permission denied. On Android: Settings → Apps → Calling Card → Permissions → Camera → Allow. Then tap Start camera again.",
          );
        }
        if (/NotFound|DevicesNotFound/i.test(msg)) {
          throw new Error("No camera found on this device.");
        }
        throw permErr;
      }

      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(readerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          void handleDecoded(decoded);
        },
        () => {
          // ignore frame miss
        },
      );
      setStatus("scanning");
    } catch (err) {
      setStatus("error");
      const message =
        err instanceof Error ? err.message : "Could not open the camera";
      if (/Permission|NotAllowed|denied/i.test(message)) {
        setError(
          message.includes("Settings")
            ? message
            : "Camera permission denied. Allow camera access and try again.",
        );
      } else if (/NotFound|DevicesNotFound/i.test(message)) {
        setError("No camera found on this device.");
      } else {
        setError(message);
      }
      await stopScanner();
    }
  }, [handleDecoded, releasePreviewStream, stopScanner]);

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, [stopScanner]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 py-8">
      <header>
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">
          Calling card
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Scan QR</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Point your camera at a Calling Card QR — from WhatsApp, another phone, or print.
          Your phone will ask for camera permission the first time.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-900">
        <div id={readerId} className="min-h-[240px] w-full" />
        {status === "idle" && !result ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center text-zinc-300">
            <ScanLine className="size-10 opacity-70" aria-hidden="true" />
            <p className="text-sm">Camera is off. Tap start — allow camera when asked.</p>
          </div>
        ) : null}
        {status === "starting" ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center text-zinc-300">
            <Loader2 className="size-8 animate-spin opacity-70" aria-hidden="true" />
            <p className="text-sm">Requesting camera permission…</p>
          </div>
        ) : null}
      </div>

      {status === "error" && error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm">
          {result.kind === "card-slug" || result.kind === "card-hash" ? (
            <p className="text-zinc-700">Opening Calling Card…</p>
          ) : null}
          {result.kind === "mecard" ? (
            <>
              <p className="font-medium text-zinc-900">Contact QR (MeCard)</p>
              <p className="mt-1 text-zinc-600">
                This is a save-to-phone contact code. Open it with your phone camera or download
                a vCard from the person’s public card page.
              </p>
              <pre className="mt-2 max-h-24 overflow-auto rounded-lg bg-zinc-50 p-2 text-xs text-zinc-500">
                {result.raw.slice(0, 200)}
              </pre>
            </>
          ) : null}
          {result.kind === "external-url" ? (
            <>
              <p className="font-medium text-zinc-900">Not a Calling Card QR</p>
              <p className="mt-1 text-zinc-600">This code points to another site.</p>
              <a
                href={result.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block break-all text-sm font-medium text-zinc-900 underline-offset-2 hover:underline"
              >
                {result.url}
              </a>
            </>
          ) : null}
          {result.kind === "unknown" ? (
            <>
              <p className="font-medium text-zinc-900">Unrecognized code</p>
              <p className="mt-1 text-zinc-600">
                Only QRs created by this app (card link or contact) are supported.
              </p>
              {lastRaw ? (
                <pre className="mt-2 max-h-24 overflow-auto rounded-lg bg-zinc-50 p-2 text-xs text-zinc-500">
                  {lastRaw.slice(0, 200)}
                </pre>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {status === "scanning" || status === "starting" ? (
          <button
            type="button"
            onClick={() => void stopScanner().then(() => setStatus("idle"))}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-800"
          >
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void startScanner()}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 text-sm font-medium text-white"
          >
            {status === "starting" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Camera className="size-4" />
            )}
            {result ? "Scan again" : "Start camera"}
          </button>
        )}
        <Link
          to="/"
          className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-800"
        >
          Home
        </Link>
      </div>

      <p className="text-center text-xs text-zinc-500">
        Works best on a phone. Allow camera when the system asks. In the Android app, grant Camera
        under App permissions if the prompt does not appear.
      </p>
    </main>
  );
}
