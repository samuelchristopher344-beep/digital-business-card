import { createFileRoute } from "@tanstack/react-router";
import { CardWorkspace } from "@/components/card-workspace";
import { EMPTY_PROFILE } from "@/lib/profile";

export const Route = createFileRoute("/create")({ component: CreatePage });

function CreatePage() {
  return (
    <CardWorkspace
      initial={{ ...EMPTY_PROFILE }}
      heading="Create your card"
      subheading="Start from a blank profile. Add your name, pick a username, then share the link."
    />
  );
}
