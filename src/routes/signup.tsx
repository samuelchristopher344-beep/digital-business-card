import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth/client";
import { emailAndPasswordEnabled } from "@/lib/auth/email-password";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!emailAndPasswordEnabled) return;
    setError("");
    setLoading(true);
    try {
      const result = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: name.trim() || email.trim().split("@")[0],
      });
      if (result.error) {
        setError(result.error.message || "Sign-up failed. Try a different email.");
        return;
      }
      await navigate({ to: "/edit" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-up failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create account</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Save your card server-side so you can sign in from any device.
        </p>
      </div>

      {emailAndPasswordEnabled ? (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Name</span>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
            />
          </label>
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
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
            />
            <span className="text-xs text-zinc-500">At least 8 characters</span>
          </label>
          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl bg-zinc-900 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Registration is not enabled yet.
        </div>
      )}

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-zinc-900 underline-offset-2 hover:underline">
          Sign in
        </Link>
        {" · "}
        <Link to="/create" className="underline-offset-2 hover:underline">
          Create without account
        </Link>
      </p>
    </main>
  );
}
