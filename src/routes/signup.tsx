import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create account</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Server-side registration will store your card so you can sign in on any
          device. For now, use the free browser-based card — share the link and it
          works for others immediately.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        Registration UI is ready; backend auth is waiting on{" "}
        <code className="rounded bg-amber-100 px-1">DATABASE_URL</code>.
      </div>

      <Link
        to="/create"
        className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white"
      >
        Create your card now
      </Link>

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-zinc-900 underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
