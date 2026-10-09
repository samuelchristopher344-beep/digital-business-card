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
    sendResetPassword: async ({ user, url }) => {
      // Wire a real mailer (Resend, Postmark, etc.) in production.
      // Until then we log so local/dev still works for testing the flow.
      console.info("[auth] Password reset requested",
        { email: user.email, resetUrl: url },
      );
      if (process.env.RESEND_API_KEY && process.env.AUTH_FROM_EMAIL) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: process.env.AUTH_FROM_EMAIL,
              to: user.email,
              subject: "Reset your Calling Card password",
              html: `<p>Hi,</p><p>Reset your password:</p><p><a href="${url}">${url}</a></p><p>If you did not ask for this, ignore this email.</p>`,
            }),
          });
        } catch (err) {
          console.error("[auth] Failed to send reset email", err);
        }
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  plugins: [tanstackStartCookies()],
});

export type Session = typeof auth.$Infer.Session;
