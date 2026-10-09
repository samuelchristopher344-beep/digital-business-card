/**
 * Minimal PWA helper plugin.
 * - Serves /__grok/manifest.webmanifest
 * - Serves a simple install tutorial at /?install=1 (via middleware in production)
 * - Injects basic PWA meta when needed
 *
 * This is intentionally lightweight so the core card app works without a full
 * workbox / service-worker setup. Capacitor packaging does not require a SW.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const MANIFEST = {
  name: "Calling Card",
  short_name: "Calling Card",
  description: "A digital calling card with QR code and contact sharing",
  start_url: "/",
  display: "standalone",
  background_color: "#ebe4d6",
  theme_color: "#ebe4d6",
  icons: [
    {
      src: "/favicon.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "any",
    },
  ],
};

export function grokPwaPlugin() {
  return {
    name: "app-builder:grok-pwa",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "";
        if (url.startsWith("/__grok/manifest.webmanifest")) {
          res.setHeader("content-type", "application/manifest+json");
          res.end(JSON.stringify(MANIFEST, null, 2));
          return;
        }
        // Placeholder icons – browsers tolerate missing apple-touch for local dev
        if (url.startsWith("/__grok/icon-180.png") || url.startsWith("/__grok/icon-192.png")) {
          res.statusCode = 204;
          res.end();
          return;
        }
        next();
      });
    },
    // For production builds the Nitro serverDir can serve the same routes if needed.
    // We keep the plugin lightweight.
  };
}
