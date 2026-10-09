import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CardWorkspace } from "@/components/card-workspace";
import { useSession } from "@/lib/auth/client";
import { EMPTY_PROFILE, readHashProfile, readStoredProfile, type Profile } from "@/lib/profile";

export const Route = createFileRoute("/edit")({ component: EditPage });

function EditPage() {
  const { data: session, isPending } = useSession();
  const [initial, setInitial] = useState<Profile | null>(null);
  const [fromServer, setFromServer] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Prefer server card when signed in
      if (session?.user) {
        try {
          const res = await fetch("/api/cards/me", { credentials: "include" });
          if (res.ok) {
            const data = (await res.json()) as { card: Profile | null };
            if (!cancelled && data.card) {
              setInitial(data.card);
              setFromServer(true);
              return;
            }
          }
        } catch {
          // fall through to local
        }
      }

      if (cancelled) return;
      setInitial(readHashProfile() ?? readStoredProfile() ?? { ...EMPTY_PROFILE });
      setFromServer(false);
    }

    if (!isPending) {
      void load();
    }

    return () => {
      cancelled = true;
    };
  }, [session?.user, isPending]);

  if (isPending || !initial) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
        Loading…
      </main>
    );
  }

  if (!initial.fullName && !initial.email && !initial.username && !fromServer) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold">No card yet</h1>
        <p className="text-sm text-zinc-600">
          You have not created a card yet. Start with a blank one.
        </p>
        <Link
          to="/create"
          className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white"
        >
          Create your card
        </Link>
      </main>
    );
  }

  return (
    <CardWorkspace
      initial={initial}
      heading="Edit your card"
      subheading={
        fromServer
          ? "Loaded from your account. Tap Save to account to update it."
          : "Changes stay in this browser until you sign in and save."
      }
    />
  );
}
