import { Link, useRouterState } from "@tanstack/react-router";
import { CreditCard, Moon, ScanLine, Settings, Sun } from "lucide-react";
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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

  function navClass(active: boolean) {
    return (
      "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors " +
      (active
        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50")
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/"
            className="min-w-0 truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            {title}
          </Link>

          <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
            <Link to="/create" className={navClass(pathname.startsWith("/create") || pathname.startsWith("/edit"))}>
              <CreditCard className="size-3.5" aria-hidden="true" />
              My card
            </Link>
            <Link to="/scan" className={navClass(pathname.startsWith("/scan"))}>
              <ScanLine className="size-3.5" aria-hidden="true" />
              Scan
            </Link>
            <Link to="/cards" className={navClass(pathname.startsWith("/cards"))}>
              Cards
            </Link>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Link
            to="/create"
            className="mr-1 hidden h-9 items-center rounded-full bg-zinc-900 px-3.5 text-sm font-medium text-white sm:inline-flex dark:bg-zinc-100 dark:text-zinc-900"
          >
            Create
          </Link>

          <button
            type="button"
            onClick={toggleDark}
            className="inline-flex size-10 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Light mode" : "Dark mode"}
          >
            {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          <Link
            to="/settings"
            className="inline-flex size-10 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="size-5" />
          </Link>
        </div>
      </div>

      {/* Mobile app tab bar under header */}
      <nav
        className="flex border-t border-zinc-100 px-2 py-1.5 sm:hidden dark:border-zinc-900"
        aria-label="App"
      >
        <Link
          to="/create"
          className={
            "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium " +
            (pathname.startsWith("/create") || pathname.startsWith("/edit")
              ? "text-zinc-900 dark:text-zinc-50"
              : "text-zinc-500")
          }
        >
          <CreditCard className="size-5" />
          Card
        </Link>
        <Link
          to="/scan"
          className={
            "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium " +
            (pathname.startsWith("/scan") ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-500")
          }
        >
          <ScanLine className="size-5" />
          Scan
        </Link>
        <Link
          to="/cards"
          className={
            "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium " +
            (pathname.startsWith("/cards") ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-500")
          }
        >
          <span className="grid size-5 place-items-center text-base leading-none">⧉</span>
          Cards
        </Link>
        <Link
          to="/settings"
          className={
            "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium " +
            (pathname.startsWith("/settings") ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-500")
          }
        >
          <Settings className="size-5" />
          Settings
        </Link>
      </nav>

      <span className="sr-only">Theme preference: {theme}</span>
    </header>
  );
}
