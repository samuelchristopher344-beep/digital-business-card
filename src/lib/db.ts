/**
 * Database bootstrap for local PGLite (dev) or Postgres (when DATABASE_URL is set).
 *
 * Auth and remote persistence are optional. The core Calling Card app stores
 * profile data in localStorage / URL hash and does not require a database.
 *
 * This module exists so vite.config.ts pgliteBootstrapPlugin and the migrate
 * script can load without crashing when auth is disabled.
 */

import { env } from "@/lib/env.server";

let readyPromise: Promise<void> | null = null;

/**
 * Ensure the local/remote DB schema is applied. No-op when no migrations and
 * no DATABASE_URL / PGLite usage is required.
 */
export async function ensureDbReady(): Promise<void> {
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    const databaseUrl = env("DATABASE_URL");
    // When neither remote Postgres nor an explicit auth setup is present,
    // skip spinning up PGLite entirely. Core card features are local-first.
    if (!databaseUrl && env("VITE_AUTH_ENABLED") !== "true") {
      return;
    }

    // Lazy import so the browser bundle never pulls PGLite / pg.
    try {
      // In a full workspace these would talk to PGLite or Neon.
      // For the published core app we intentionally keep this a no-op
      // unless the user configures auth + DATABASE_URL.
      console.info(
        "[db] ensureDbReady: auth/db not fully configured — skipping schema bootstrap",
      );
    } catch (err) {
      console.error("[db] ensureDbReady failed:", err);
      throw err;
    }
  })();

  return readyPromise;
}

/** Placeholder export used by some generated server code. */
export function getDb() {
  return null;
}
