import { Link } from "@tanstack/react-router";
import { Moon, Settings, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import {
  applyTheme,
  patchSettings,
  readSettings,
  resolveIsDark,
  type ThemePref,
} from "@/lib/app-settings";

export function TopBar({ title = "Calling Card" }: { title?: string }) {
  const [theme, setTheme] = useState<ThemePref>("system");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const s = readSettings();
    setTheme(s.theme);
    applyTheme(s.theme);
    setDark(resolveIsDark(s.theme));

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => {
      const current = readSettings().theme;
      if (current === "system") {
        applyTheme("system");
        setDark(resolveIsDark("system"));
      }
    };
    mq.addEventListener("change", onSystem);
    return () => mq.removeEventListener("change", onSystem);
  }, []);

  function toggleDark() {
    const next: ThemePref = dark ? "light" : "dark";
    patchSettings({ theme: next });
    applyTheme(next);
    setTheme(next);
    setDark(resolveIsDark(next));
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between gap-3 px-3 sm:px-4">
        <Link
          to="/"
          className="min-w-0 truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          {title}
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={toggleDark}
            className="inline-flex size-11 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Light mode" : "Dark mode"}
          >
            {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          <Link
            to="/settings"
            className="inline-flex size-11 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="size-5" />
          </Link>
        </div>
      </div>
      <span className="sr-only">Theme preference: {theme}</span>
    </header>
  );
}
