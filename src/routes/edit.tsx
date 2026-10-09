import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CardWorkspace } from "@/components/card-workspace";
import { EMPTY_PROFILE, readHashProfile, readStoredProfile, type Profile } from "@/lib/profile";

export const Route = createFileRoute("/edit")({ component: EditPage });

function EditPage() {
  const [initial, setInitial] = useState<Profile | null>(null);

  useEffect(() => {
    setInitial(readHashProfile() ?? readStoredProfile() ?? { ...EMPTY_PROFILE });
  }, []);

  if (!initial) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
        Loading…
      </main>
    );
  }

  if (!initial.fullName && !initial.email && !initial.username) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold">No card yet</h1>
        <p className="text-sm text-zinc-600">
          You have not created a card in this browser. Start with a blank one.
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
      subheading="Changes stay in this browser and update your share link."
    />
  );
}
