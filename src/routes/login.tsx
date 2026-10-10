import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth/client";
import { emailAndPasswordEnabled } from "@/lib/auth/email-password";
import { recordLoginAlert } from "@/lib/privacy-vault";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
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
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      if (result.error) {
        setError(result.error.message || "Sign-in failed. Check your email and password.");
        return;
      }
      recordLoginAlert("Signed in successfully on this device");
      await navigate({ to: "/edit" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col bg-white px-5 dark:bg-zinc-950">
      <div className="flex flex-1 flex-col pt-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Find your account
        </h1>
        <p className="mt-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          Sign in to open your Calling Card on this device.
        </p>

        {emailAndPasswordEnabled ? (
          <form onSubmit={onSubmit} className="mt-8 flex flex-1 flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  Password
                </span>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-blue-600 underline-offset-2 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </p>
            ) : null}

            <div className="mt-auto flex flex-col gap-3 pb-8 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex h-14 w-full items-center justify-center rounded-full bg-blue-600 text-base font-semibold text-white disabled:opacity-60 dark:bg-blue-500"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
              <Link
                to="/signup"
                className="flex h-14 w-full items-center justify-center rounded-full bg-zinc-100 text-base font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
              >
                Get started
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            Email/password sign-in is not enabled yet.
          </div>
        )}
      </div>
    </main>
  );
}
