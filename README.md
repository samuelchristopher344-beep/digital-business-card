# Calling Card (digital-business-card)

A professional digital business card app with QR codes, contact sharing (vCard / MeCard), and customizable profiles.

Built with **TanStack Start**, **React 19**, **Tailwind CSS**, **Better Auth**, and **Zustand**.

## Features

- Live QR code for your profile / contact info
- Editable profile (name, role, org, links, focus tags)
- Theme support (Brass, Signal, Tide, Graphite)
- vCard / MeCard download & share
- Shareable hash-encoded profile links
- Local card store with templates and stats tracking

## Stack

- TanStack Router + Start (SSR)
- Vite 8 + React 19
- Tailwind CSS 4
- Better Auth + PGLite / Postgres
- Zustand (persisted card store)
- `qrcode` for SVG QR generation

## Getting started

```bash
npm install
npm run dev
```

App runs on port **8080** by default.

## What’s in the repo

**Core app (ready):**
- `src/routes/index.tsx` — main UI (card + QR + profile editor)
- `src/components/*` — CallingCard, QrMark
- `src/lib/profile.ts`, `card-model.ts`, `card-store.ts`
- `src/styles.css`, `vite.config.ts`, `package.json`
- Auth scaffolding + migration + key scripts

**Still optional to push from workspace:**
- Full auth client/server (`src/lib/auth/client.ts`, `server.ts`, gates, etc.)
- `src/lib/db.ts`, `preview-host-bridge.ts`
- Remaining scripts (PWA, preview, browser smoke tests)
- `package-lock.json`, screenshots, public install assets

Repo: https://github.com/samuelchristopher344-beep/digital-business-card
