import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";
import { getCardByUserId, rowToProfile, upsertCardForUser } from "@/lib/cards.server";
import type { Profile } from "@/lib/profile";

async function sessionUser(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user ?? null;
}

export const Route = createFileRoute("/api/cards/me")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const user = await sessionUser(request);
        if (!user) {
          return Response.json({ error: "Sign in required" }, { status: 401 });
        }
        const row = await getCardByUserId(user.id);
        if (!row) {
          return Response.json({ card: null });
        }
        return Response.json({ card: rowToProfile(row) });
      },
      PUT: async ({ request }: { request: Request }) => {
        const user = await sessionUser(request);
        if (!user) {
          return Response.json({ error: "Sign in required" }, { status: 401 });
        }
        let body: Profile;
        try {
          body = (await request.json()) as Profile;
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
        const result = await upsertCardForUser(user.id, body);
        if (!result.ok) {
          return Response.json({ error: result.error }, { status: result.status });
        }
        return Response.json({ card: rowToProfile(result.card) });
      },
    },
  },
});
