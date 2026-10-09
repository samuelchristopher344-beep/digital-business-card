import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth/client";
import { emailAndPasswordEnabled } from "@/lib/auth/email-password";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token: searchToken } = Route.useSearch();
  const token = useMemo(() => {
    if (searchToken) return searchToken;
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("token") || "";
  }, [searchToken]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!emailAndPasswordEnabled) return;
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Missing reset token. Open the link from your email again.");
      return;
    }
    setLoading(true);
    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (result.error) {
        setError(result.error.message || "Could not reset password. The link may have expired.");
        return;
      }
      setDone(true);
      setTimeout(() => {
        void navigate({ to: "/login" });
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Set new password</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Choose a new password for your Calling Card account.
        </p>
      </div>

      {done ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
          Password updated. Taking you to sign in…
        </div>
      ) : emailAndPasswordEnabled ? (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {!token ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              No reset token found. Use the link from your email, or request a new one.
            </p>
          ) : null}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              New password
            </span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              Confirm password
            </span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
            />
          </label>
          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading || !token}
            className="h-11 rounded-xl bg-zinc-900 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Saving…" : "Update password"}
          </button>
        </form>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Email/password auth is not enabled yet.
        </div>
      )}

      <p className="text-center text-sm text-zinc-500">
        <Link
          to="/forgot-password"
          className="font-medium text-zinc-900 underline-offset-2 hover:underline"
        >
          Request a new link
        </Link>
        {" · "}
        <Link to="/login" className="underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
