import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Pool } from "pg";
import { emailAndPasswordEnabled } from "./email-password";

const databaseUrl = process.env.DATABASE_URL?.trim();
const secret = process.env.BETTER_AUTH_SECRET?.trim();

if (!databaseUrl) {
  console.warn("[auth] DATABASE_URL is not set — Better Auth will not persist sessions.");
}
if (!secret) {
  console.warn("[auth] BETTER_AUTH_SECRET is not set — sessions will not be secure.");
}

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      max: 5,
      ssl:
        databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1")
          ? undefined
          : { rejectUnauthorized: false },
    })
  : null;

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
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh every day
  },
  plugins: [tanstackStartCookies()],
});

export type Session = typeof auth.$Infer.Session;
