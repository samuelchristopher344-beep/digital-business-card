import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, IdCard, Link2, QrCode, Shield, Smartphone } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { emailAndPasswordEnabled } from "@/lib/auth/email-password";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"welcome" | "form">("welcome");
  const [name, setName] = useState("");
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
      const result = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: name.trim() || email.trim().split("@")[0],
      });
      if (result.error) {
        setError(result.error.message || "Sign-up failed. Try a different email.");
        return;
      }
      await navigate({ to: "/edit" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-up failed.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "welcome") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col bg-white px-5 dark:bg-zinc-950">
        <div className="flex flex-1 flex-col pt-8">
          <div className="relative mb-8 flex h-32 w-full items-center justify-center">
            <div className="absolute left-[12%] top-2 flex size-12 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900">
              <IdCard className="size-6" aria-hidden />
            </div>
            <div className="absolute right-[14%] top-0 flex size-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
              <Shield className="size-5" aria-hidden />
            </div>
            <div className="z-10 flex size-16 items-center justify-center rounded-[1.5rem] bg-zinc-900 text-white shadow-xl dark:bg-zinc-100 dark:text-zinc-900">
              <QrCode className="size-8" aria-hidden />
            </div>
          </div>

          <h1 className="text-center text-2xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50">
            Why create an account?
          </h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Optional — only if you want your card on more than one device.
          </p>

          <ul className="mt-8 space-y-3">
            <Benefit
              icon={<Smartphone className="size-4" />}
              title="Same card on phone and laptop"
              body="Sign in anywhere and your cards are already there."
            />
            <Benefit
              icon={<Link2 className="size-4" />}
              title="Claim a stable public link"
              body="A permanent /u/you link that works after you close the browser."
            />
            <Benefit
              icon={<Shield className="size-4" />}
              title="Still private"
              body="No who-viewed list. Notes and tags stay on your device."
            />
          </ul>

          <p className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-center text-xs leading-relaxed text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            You can keep using Calling Card without an account. Create and share a card in this
            browser first if you prefer.
          </p>
        </div>

        <div className="sticky bottom-0 flex flex-col gap-3 bg-white pb-8 pt-4 dark:bg-zinc-950">
          <button
            type="button"
            onClick={() => setStep("form")}
            className="flex h-14 w-full items-center justify-center rounded-full bg-zinc-900 text-base font-semibold text-white shadow-sm active:scale-[0.99] dark:bg-zinc-100 dark:text-zinc-900"
          >
            Create account
          </button>
          <Link
            to="/login"
            className="flex h-14 w-full items-center justify-center rounded-full bg-zinc-100 text-base font-semibold text-zinc-900 active:scale-[0.99] dark:bg-zinc-800 dark:text-zinc-50"
          >
            I already have an account
          </Link>
          <Link
            to="/create"
            className="mt-1 text-center text-sm font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
          >
            Continue without an account →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col bg-white px-5 dark:bg-zinc-950">
      <div className="flex flex-1 flex-col pt-6">
        <button
          type="button"
          onClick={() => setStep("welcome")}
          className="mb-6 self-start text-sm font-medium text-zinc-600 dark:text-zinc-400"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Create your account
        </h1>
        <p className="mt-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          One account for your card on every device. We only use this to sync your cards.
        </p>

        {emailAndPasswordEnabled ? (
          <form onSubmit={onSubmit} className="mt-8 flex flex-1 flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Name</span>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                Password
              </span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
              />
              <span className="text-xs text-zinc-500">At least 8 characters</span>
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
                className="flex h-14 w-full items-center justify-center rounded-full bg-zinc-900 text-base font-semibold text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
              <Link
                to="/login"
                className="flex h-14 w-full items-center justify-center rounded-full bg-zinc-100 text-base font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
              >
                I already have an account
              </Link>
              <Link
                to="/create"
                className="text-center text-sm text-zinc-500 underline-offset-2 hover:underline"
              >
                Continue without an account
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            Registration is not enabled yet.
          </div>
        )}
      </div>
    </main>
  );
}

function Benefit({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-white text-zinc-800 shadow-sm dark:bg-zinc-800 dark:text-zinc-100">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          <Check className="size-3.5 text-emerald-600" aria-hidden />
          {title}
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-zinc-600 dark:text-zinc-400">{body}</span>
      </span>
    </li>
  );
}
