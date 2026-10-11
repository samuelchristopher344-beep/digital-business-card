# Calling Card (digital-business-card)

A professional digital business card app with QR codes, contact sharing (vCard / MeCard), and customizable profiles.

Built with **TanStack Start**, **React 19**, **Tailwind CSS**, **Zustand**, and optional **Better Auth** + PGLite/Postgres.

**Live site:** https://digital-business-card-samuelchristopher344-beep.vercel.app

## Features that work (local-first)

- Live QR code for your profile link or MeCard contact payload
- Editable profile (name, role, org, links, focus tags, theme)
- **Card types**: Personal, Business, Company, Organization, Event, Creator
- **International phone numbers** with country code selector (stored as E.164)
- Four themes: Brass, Signal, Tide, Graphite
- vCard (`.vcf`) download and MeCard QR mode
- Shareable hash-encoded profile links (`#c=...`)
- Local storage persistence of the profile (and multi-card support)
- Responsive layout (mobile → desktop)
- Shared/downloaded card **image includes a large scannable QR code**

## Phone apps (Android + iOS)

Capacitor wraps the live web app in a native shell for both platforms.

### Android – download APK

1. Go to **Actions**: https://github.com/samuelchristopher344-beep/digital-business-card/actions  
2. Open **Build Android APK** → **Run workflow** (or wait for auto-run)  
3. Download artifact **Calling-Card-debug**  
4. Install the `.apk` on your Android phone (allow unknown sources if asked)

### iOS – simulator build (free)

1. Same **Actions** tab → open **Build iOS**  
2. **Run workflow**  
3. Download **Calling-Card-ios-simulator** (zipped `.app` for iOS Simulator)  

**Real iPhone / App Store** requires:
- A Mac with Xcode, **or** this GitHub Action + signing secrets  
- **Apple Developer Program** ($99/year)  
- Signing certificate + provisioning profile  

On a Mac:

```bash
npm install
node scripts/setup-capacitor.mjs ios
npx cap open ios          # opens Xcode
npx cap run ios           # simulator or device
```

### Local setup (both platforms)

```bash
npm install
node scripts/setup-capacitor.mjs          # Android + iOS (iOS only on Mac)
node scripts/setup-capacitor.mjs android  # Android only
node scripts/setup-capacitor.mjs ios      # iOS only (Mac)
```

## Getting started (web)

```bash
npm install
npm run dev
```

App runs on port **8080** by default.

```bash
npm run build
npm run preview
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
- Capacitor 7 (Android + iOS)
- Better Auth + PGLite / Postgres (optional)

## Repository status

**Core app (ready)** — UI, QR, profile, themes, vCard/MeCard, share image with QR  
**Android** — Capacitor + GitHub Action for debug APK  
**iOS** — Capacitor package + scripts + GitHub Action (simulator build)  
**App Store / Play Store** — need developer accounts + signing for public release

Repo: https://github.com/samuelchristopher344-beep/digital-business-card
