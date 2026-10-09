import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth/client";
import { emailAndPasswordEnabled } from "@/lib/auth/email-password";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!emailAndPasswordEnabled) return;
    setError("");
    setLoading(true);
    try {
      const result = await authClient.forgetPassword({
        email: email.trim(),
        redirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/reset-password`
            : "/reset-password",
      });
      if (result.error) {
        setError(result.error.message || "Could not start password reset.");
        return;
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start password reset.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Forgot password</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Enter the email for your account. If it exists, we send a reset link.
        </p>
      </div>

      {done ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
          <p className="font-medium">Check your email</p>
          <p className="mt-1">
            If an account exists for that address, a reset link is on the way. It may take a minute.
          </p>
          <p className="mt-2 text-xs text-emerald-800/80">
            Tip: also check spam. If nothing arrives, email delivery may not be configured on the
            server yet — ask the app owner to set RESEND_API_KEY and AUTH_FROM_EMAIL.
          </p>
        </div>
      ) : emailAndPasswordEnabled ? (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
            />
          </label>
          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl bg-zinc-900 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Email/password auth is not enabled yet.
        </div>
      )}

      <p className="text-center text-sm text-zinc-500">
        <Link to="/login" className="font-medium text-zinc-900 underline-offset-2 hover:underline">
          Back to sign in
        </Link>
        {" · "}
        <Link to="/" className="underline-offset-2 hover:underline">
          Home
        </Link>
      </p>
    </main>
  );
}
