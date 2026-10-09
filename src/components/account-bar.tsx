import { Link, useNavigate } from "@tanstack/react-router";
import { authClient, useSession } from "@/lib/auth/client";

export function AccountBar() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  if (isPending) {
    return (
      <div className="border-b border-zinc-200 bg-white px-4 py-2 text-center text-xs text-zinc-500">
        Checking account…
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center gap-3 border-b border-zinc-200 bg-white px-4 py-2 text-xs">
        <Link to="/login" className="font-medium text-zinc-900 underline-offset-2 hover:underline">
          Sign in
        </Link>
        <span className="text-zinc-300">·</span>
        <Link to="/signup" className="text-zinc-600 underline-offset-2 hover:underline">
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
    <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-2 text-xs">
      <p className="truncate text-zinc-600">
        Signed in as <span className="font-medium text-zinc-900">{name}</span>
      </p>
      <button
        type="button"
        onClick={onSignOut}
        className="shrink-0 font-medium text-zinc-900 underline-offset-2 hover:underline"
      >
        Sign out
      </button>
    </div>
  );
}
