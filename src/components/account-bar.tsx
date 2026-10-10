import { Link, useNavigate } from "@tanstack/react-router";
import { authClient, useSession } from "@/lib/auth/client";

/** Soft account strip — never blocks creating or sharing a card. */
export function AccountBar() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  if (isPending) {
    return null;
  }

  if (!session?.user) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
        <span>Account is optional — your card works without one.</span>
        <span className="text-zinc-300 dark:text-zinc-600">·</span>
        <Link to="/login" className="font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100">
          Sign in
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600">·</span>
        <Link to="/signup" className="underline-offset-2 hover:underline">
          Create account
        </Link>
      </div>
    );
  }

  const name = session.user.name || session.user.email || "Account";

  async function onSignOut() {
    await authClient.signOut();
    await navigate({ to: "/" });
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-950">
      <p className="truncate text-zinc-600 dark:text-zinc-400">
        Signed in as <span className="font-medium text-zinc-900 dark:text-zinc-100">{name}</span>
      </p>
      <button
        type="button"
        onClick={onSignOut}
        className="shrink-0 font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
      >
        Sign out
      </button>
    </div>
  );
}
