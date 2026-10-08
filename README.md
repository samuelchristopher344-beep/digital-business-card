# Calling Card (digital-business-card)

A professional digital business card app with QR codes, contact sharing (vCard / MeCard), and customizable profiles.

Built with **TanStack Start**, **React 19**, **Tailwind CSS**, **Better Auth**, and **Zustand**.

## Features

- Live QR code for your profile / contact info
- Editable profile (name, role, org, links, focus tags)
- Theme support
- vCard / MeCard download & share
- Local card store with stats tracking

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

App runs on port 8080 by default.

## Status

Core app structure, components, package, configs, and card store have been pushed.  
Remaining workspace files (full auth stack, scripts, larger libs like `card-model`, main route, vite config, styles) can be pushed on request.

Repo: https://github.com/samuelchristopher344-beep/digital-business-card
