# Kamr

Event photo-sharing app. Create events, invite guests via QR code or link, organize photos into named albums — no account required.

**Web:** [kamr.app](https://kamr.app) (landing) · [kamr.app/app](https://kamr.app/app) (web app)  
**Mobile:** iOS app for frequent hosts (Expo)

## Stack

- **Website**: Vite + React (landing + web app at `/app`)
- **Mobile**: Expo (React Native) + expo-router
- **API**: Cloudflare Worker + Hono
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (photos)

## Project structure

```
kamr/
├── apps/mobile/       # Expo mobile app
├── website/           # Marketing site + web app (kamr.app)
├── packages/api/      # Cloudflare Worker API
└── packages/shared/   # Shared TypeScript types
```

## Prerequisites

- Node.js 18+
- pnpm (`npx pnpm` works if not installed globally)
- Expo Go app on your phone (for mobile testing)
- Cloudflare account (for production deploy; local dev works without it)

## Setup

```bash
# Install dependencies
npx pnpm install

# Apply local D1 migrations
npx pnpm db:migrate:local
```

**pnpm 11 note:** If install fails with `ERR_PNPM_IGNORED_BUILDS`, ensure `pnpm-workspace.yaml` includes `allowBuilds` for `esbuild`, `workerd`, and `sharp` (already configured in this repo). Do not use `.npmrc` for this — pnpm 11 reads build settings from `pnpm-workspace.yaml`.

## Local development

Run in separate terminals:

```bash
# Terminal 1 — API (http://localhost:8787)
npx pnpm dev:api

# Terminal 2 — Website (http://localhost:3000)
npx pnpm dev:website

# Terminal 3 — Mobile app (optional)
npx pnpm dev:mobile
```

The website reads `VITE_API_URL` from `website/.env` (defaults to `http://localhost:8787`).
The mobile app reads `EXPO_PUBLIC_API_URL` from `apps/mobile/.env` (defaults to `http://localhost:8787`).

For physical device testing, set `EXPO_PUBLIC_API_URL` to your machine's LAN IP (e.g. `http://192.168.1.10:8787`).

## Features

- **Create events** with name and start date
- **Invite via QR code or shareable link** — no account needed to join
- **Guest display names** per event, editable by guest or admin
- **Named albums** — admin can create, rename, and delete
- **Photo and video uploads** during active events
- **Read-only after event ends** — albums remain visible, uploads disabled
- **Admin recovery link** to restore access on a new device

## API endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/events` | Create event |
| GET | `/events/by-code/:code` | Public event info |
| POST | `/events/by-code/:code/join` | Join with display name |
| GET | `/events/:id` | Event detail + albums |
| PATCH | `/events/:id` | Update event (admin) |
| POST | `/events/:id/albums` | Create album (admin) |
| PATCH | `/albums/:id` | Rename album (admin) |
| DELETE | `/albums/:id` | Delete album (admin) |
| GET | `/albums/:id/photos` | List photos |
| POST | `/albums/:id/photos` | Upload photo (participant, active event) |
| GET | `/photos/:id/content` | Get photo file |

Auth: `Authorization: Bearer <secret>` header with admin or participant secret.

## Deploy (Cloudflare)

```bash
cd packages/api

# Create D1 database and R2 bucket in Cloudflare dashboard, update wrangler.jsonc
npx wrangler d1 migrations apply pahl-db --remote
npx wrangler deploy
```

Update `website/.env` and `apps/mobile/.env` with your production API URL before building.

### Website (Cloudflare Pages)

```bash
npx pnpm build:website
# Deploy website/dist to Cloudflare Pages with SPA fallback for /app/*, /join/*, /admin/*
```

## Deep links

- Join: `kamr://join/{inviteCode}`
- Admin recovery: `kamr://admin/{inviteCode}?token={adminSecret}`

Web links use `https://kamr.app/join/{inviteCode}` and `https://kamr.app/admin/{inviteCode}?token={adminSecret}`.
