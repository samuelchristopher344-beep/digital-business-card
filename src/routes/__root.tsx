import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { TopBar } from "@/components/top-bar";
import { initThemeFromStorage } from "@/lib/app-settings";
import appCss from "../styles.css?url";

const APP_NAME = "Calling Card";

function ThemeBoot() {
  // Run as early as possible on the client
  if (typeof window !== "undefined") {
    initThemeFromStorage();
  }
  return null;
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "A digital calling card with QR, contact save, private notes, and clear privacy controls.",
      },
      { name: "theme-color", content: "#ebe4d6" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640&family=Outfit:wght@400;500;600&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='cc.app-settings.v1';var raw=localStorage.getItem(k);var theme='system';if(raw){var p=JSON.parse(raw);if(p&&p.theme)theme=p.theme;}var dark=theme==='dark'||(theme==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.dataset.mode=dark?'dark':'light';r.dataset.theme=theme;r.classList.toggle('dark',dark);r.style.colorScheme=dark?'dark':'light';}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeBoot />
        <PreviewHostBridge />
        <AuthProvider>
          <TopBar />
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
