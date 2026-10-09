import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { emailAndPasswordEnabled } from "./email-password";
import { getPool } from "@/lib/db-pool";

const secret = process.env.BETTER_AUTH_SECRET?.trim();
const pool = getPool();

if (!pool) {
  console.warn("[auth] DATABASE_URL is not set — Better Auth will not persist sessions.");
}
if (!secret) {
  console.warn("[auth] BETTER_AUTH_SECRET is not set — sessions will not be secure.");
}

export const auth = betterAuth({
  database: pool ?? undefined,
  secret: secret || "dev-only-insecure-secret-change-me-32chars",
  baseURL:
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.VITE_SITE_URL?.trim() ||
    undefined,
  emailAndPassword: {
    enabled: emailAndPasswordEnabled,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  plugins: [tanstackStartCookies()],
});

export type Session = typeof auth.$Infer.Session;
