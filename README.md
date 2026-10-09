# Calling Card (digital-business-card)

A professional digital business card app with QR codes, contact sharing (vCard / MeCard), and customizable profiles.

Built with **TanStack Start**, **React 19**, **Tailwind CSS**, **Zustand**, and optional **Better Auth** + PGLite/Postgres.

## Features that work (local-first)

- Live QR code for your profile link or MeCard contact payload
- Editable profile (name, role, org, links, focus tags, theme)
- Four themes: Brass, Signal, Tide, Graphite
- vCard (`.vcf`) download and MeCard QR mode
- Shareable hash-encoded profile links (`#p=...`)
- Local storage persistence of the profile
- Responsive layout (mobile → desktop)

## Optional / scaffolding (not fully wired)

- Better Auth (Google / X via broker) — scaffolding only; sign-in is disabled by default
- Remote Postgres / Neon + SQL migrations — present but inactive without `DATABASE_URL`
- Full multi-card Zustand store (`card-store.ts`) — exists but the main route uses the simpler single-profile flow
- PWA manifest — lightweight plugin added; no service worker yet
- Capacitor Android packaging — prepared for, not yet initialized

## Stack

- TanStack Router + Start (SSR-capable)
- Vite 8 + React 19
- Tailwind CSS 4
- Zustand (card store available)
- `qrcode` for SVG QR generation
- Better Auth + PGLite / Postgres (optional)

## Getting started

```bash
npm install
npm run dev
```

App runs on port **8080** by default.

```bash
npm run build   # production build (skips DB migrate when DATABASE_URL is unset)
npm run preview # local production preview
```

## Environment

Copy `.env.example` if you want to experiment with auth later. For the core card you do **not** need any environment variables.

Never commit real secrets.

## Capacitor / Android (phone development)

Because you develop on an Android phone, use a cloud builder rather than a local Android SDK:

1. On a machine (or GitHub Codespaces / Gitpod / a free cloud VM) that has Node:

   ```bash
   npm install
   npm run build
   npx cap init "Calling Card" com.christoflightx.callingcard --web-dir dist
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap add android
   npx cap sync
   ```

2. Build the web assets into `dist/`, then sync:

   ```bash
   npm run build
   npx cap sync android
   ```

3. To produce an APK/AAB without a local Android Studio install, use one of:

   - **GitHub Actions** with an Android build action (recommended)
   - **Codemagic**, **Bitrise**, or similar free tiers
   - A temporary Gitpod / Codespaces instance that installs the Android SDK and runs:

     ```bash
     cd android
     ./gradlew assembleDebug          # APK
     ./gradlew bundleRelease          # AAB (needs signing config)
     ```

4. Install the resulting APK on your phone via USB, Files app, or a link.

Capacitor config and the `android/` folder are intentionally **not** committed until you run `cap add android` yourself (they are large and machine-specific).

## Repository status

**Core app (ready):**

- `src/routes/index.tsx` — main UI (card + QR + profile editor)
- `src/components/*` — CallingCard, QrMark
- `src/lib/profile.ts`, `card-model.ts`, `card-store.ts`
- `src/styles.css`, `vite.config.ts`, `package.json`
- Auth scaffolding + migration + key scripts

**Added / completed in this pass:**

- `scripts/with-app-env.mjs`
- `scripts/grok-pwa-plugin.mjs` (minimal PWA manifest)
- `src/lib/db.ts` (safe no-op when auth/DB off)
- `src/lib/auth/popup.server.ts` (safe stub)
- `.env.example`
- Cleaned `package.json` scripts that pointed at missing files
- Updated `.gitignore`

**Still optional / unfinished:**

- Full Better Auth client + server wiring
- Real PGLite bootstrap when auth is enabled
- Service-worker / full offline PWA
- Capacitor project files and CI for APK/AAB
- Multi-card management UI (store exists, main route is single-profile)

Repo: https://github.com/samuelchristopher344-beep/digital-business-card
