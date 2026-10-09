#!/usr/bin/env node
/**
 * Thin launcher that ensures common env defaults are present for Vite / Nitro.
 * Does not override existing process.env values.
 *
 * Usage: node scripts/with-app-env.mjs <command> [...args]
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const defaults = {
  // Local-first: auth and remote DB off unless the user configures them.
  VITE_AUTH_ENABLED: process.env.VITE_AUTH_ENABLED ?? "false",
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "",
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  // Port contract for live preview
  PORT: process.env.PORT ?? "8080",
};

for (const [key, value] of Object.entries(defaults)) {
  if (process.env[key] === undefined || process.env[key] === "") {
    process.env[key] = value;
  }
}

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error("Usage: node scripts/with-app-env.mjs <command> [...args]");
  process.exit(1);
}

const child = spawn(cmd, args, {
  stdio: "inherit",
  shell: false,
  env: process.env,
  cwd: root,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 1);
  }
});
