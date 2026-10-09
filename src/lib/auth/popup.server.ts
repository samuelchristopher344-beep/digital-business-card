/**
 * Live-preview OAuth popup handler.
 *
 * When full Better Auth + broker is configured this performs the real
 * redirect / completion HTML. For the core local-first Calling Card app
 * auth is disabled, so we return a clear "not configured" response.
 */

export async function handleAuthPopupRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const providerId = url.searchParams.get("providerId") ?? "unknown";

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Sign-in unavailable</title>
  <style>
    body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #ebe4d6; color: #161411; }
    main { max-width: 28rem; padding: 2rem; text-align: center; }
    h1 { font-size: 1.25rem; margin-bottom: 0.5rem; }
    p { color: #5c564c; line-height: 1.5; }
  </style>
</head>
<body>
  <main>
    <h1>Sign-in is not configured</h1>
    <p>This Calling Card build runs locally without authentication.
    Provider requested: <strong>${providerId}</strong>.</p>
    <p>Close this window and continue using the card offline.</p>
  </main>
  <script>
    // Allow the opener to know the popup finished (even if auth failed).
    try { window.opener && window.opener.postMessage({ type: "auth-popup-done", ok: false }, "*"); } catch (_) {}
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
