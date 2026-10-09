import { createFileRoute } from "@tanstack/react-router";
import { getPublicCardByUsername, rowToProfile } from "@/lib/cards.server";

export const Route = createFileRoute("/api/cards/$username")({
  server: {
    handlers: {
      GET: async ({
        params,
      }: {
        params: { username: string };
      }) => {
        const row = await getPublicCardByUsername(params.username);
        if (!row) {
          return Response.json({ error: "Card not found" }, { status: 404 });
        }
        return Response.json({ card: rowToProfile(row) });
      },
    },
  },
});
