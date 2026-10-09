# Calling Card (digital-business-card)

A professional digital business card app with QR codes, contact sharing (vCard / MeCard), and customizable profiles.

Built with **TanStack Start**, **React 19**, **Tailwind CSS**, **Zustand**, and optional **Better Auth** + PGLite/Postgres.

**Live site:** https://digital-business-card.vercel.app (or the latest production deployment on Vercel)

## Features that work (local-first)

- Live QR code for your profile link or MeCard contact payload
- Editable profile (name, role, org, links, focus tags, theme)
- Four themes: Brass, Signal, Tide, Graphite
- vCard (`.vcf`) download and MeCard QR mode
- Shareable hash-encoded profile links (`#p=...`)
- Local storage persistence of the profile
- Responsive layout (mobile → desktop)

## Phone app (Android)

Capacitor is fully prepared. You do **not** need a computer with Android Studio.

### Easiest way – download a ready APK

1. Go to the repository **Actions** tab:  
   https://github.com/samuelchristopher344-beep/digital-business-card/actions
2. Open the workflow **Build Android APK**
3. Click **Run workflow** (or wait for the automatic run after a push)
4. When it finishes, download the artifact named **Calling-Card-debug**
5. Open the `.apk` on your Android phone and install it  
   (you may need to allow “Install from unknown sources”)

The APK is rebuilt automatically on every relevant push to `main`.

### Alternative – load the live website inside a native shell

If you prefer the native app to always show the latest live website (instead of a bundled static build), edit `capacitor.config.ts` and uncomment the `url` line pointing to your Vercel deployment, then re-run the build workflow.

### Local / cloud development (optional)

```bash
npm install
node scripts/setup-capacitor.mjs   # builds + adds Android + syncs
npx cap open android               # opens Android Studio
npx cap run android                # run on device/emulator
```

## Getting started (web)

```bash
npm install
npm run dev
```

App runs on port **8080** by default.

```bash
npm run build   # production build
npm run preview # local production preview
```

## Environment

Copy `.env.example` if you want to experiment with auth later. For the core card you do **not** need any environment variables.

Never commit real secrets.

## Stack

- TanStack Router + Start (SSR-capable)
- Vite 8 + React 19
- Tailwind CSS 4
- Zustand
- `qrcode` for SVG QR generation
- Capacitor 7 (Android packaging)
- Better Auth + PGLite / Postgres (optional)

## Repository status

**Core app (ready)**  
Main UI, QR, profile editor, themes, local storage, vCard/MeCard.

**Capacitor / Android (ready for APK)**  
- `capacitor.config.ts`  
- packages + scripts  
- GitHub Action that produces a downloadable debug APK  
- `scripts/setup-capacitor.mjs`

**Still optional / unfinished**
- Full Better Auth client + server wiring
- Real multi-card management UI
- Full offline PWA service worker
- iOS platform (can be added the same way)

Repo: https://github.com/samuelchristopher344-beep/digital-business-card
