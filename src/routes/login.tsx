import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Cross-device accounts need a database connection (Postgres / Neon) and
          auth secrets. Until those are configured, create and edit cards in this
          browser — your share link still works for anyone.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <strong className="font-semibold">Not enabled yet.</strong> Set{" "}
        <code className="rounded bg-amber-100 px-1">DATABASE_URL</code> and{" "}
        <code className="rounded bg-amber-100 px-1">BETTER_AUTH_SECRET</code> on
        Vercel, then email/password or Google sign-in can be turned on.
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          disabled
          className="h-11 rounded-xl bg-zinc-200 text-sm font-medium text-zinc-500"
        >
          Continue with Google (soon)
        </button>
        <button
          type="button"
          disabled
          className="h-11 rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-500"
        >
          Email & password (soon)
        </button>
      </div>

      <p className="text-center text-sm text-zinc-500">
        <Link to="/create" className="font-medium text-zinc-900 underline-offset-2 hover:underline">
          Create a card without an account
        </Link>
        {" · "}
        <Link to="/" className="underline-offset-2 hover:underline">
          Home
        </Link>
      </p>
    </main>
  );
}
