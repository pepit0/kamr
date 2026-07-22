# Deploy Kamr API (Cloudflare Workers)

The website on Vercel calls `VITE_API_URL`. The API runs on Cloudflare Workers (`packages/api`).

## Current production

| Resource | Value |
|----------|--------|
| Worker | `kamr-api` |
| Worker URL | `https://kamr-api.danielsharifian.workers.dev` |
| D1 database | `pahl-db` (`5963399d-067f-41f2-a9a3-0fd190f8571d`) |
| Health check | `GET /health` → `{"status":"ok"}` |

## One-time: enable R2 (photo uploads)

Photo uploads require R2. The account must enable R2 first:

1. Open [Cloudflare R2](https://dash.cloudflare.com/?to=/:account/r2/overview) and accept terms / enable R2.
2. Create the bucket:

```bash
cd packages/api
npx wrangler r2 bucket create pahl-photos
```

3. Uncomment the `r2_buckets` block in `wrangler.jsonc` and redeploy:

```bash
npx wrangler deploy
```

## Deploy / update the API

```bash
# From repo root (use npx pnpm if pnpm is not installed globally)
npx pnpm deploy:api
```

## Vercel env var

In Vercel → **kamr** → **Settings** → **Environment Variables**:

| Name | Production value |
|------|------------------|
| `VITE_API_URL` | `https://kamr-api.danielsharifian.workers.dev` |

Redeploy the website after changing this (Vite bakes env vars at build time).

## Custom domain `api.kamr.app` (optional)

`kamr.app` DNS is on **Vercel**. Cloudflare **Custom Domains** for Workers require `kamr.app` to be an active zone on Cloudflare.

Recommended setup:

1. [Add `kamr.app` to Cloudflare](https://dash.cloudflare.com/?to=/:account/domains/add) (free plan).
2. At Vercel → **Domains** → `kamr.app`, change nameservers to Cloudflare’s (or register transfers DNS to Cloudflare).
3. In Cloudflare DNS:
   - `@` and `www` → point to Vercel (see [Vercel + Cloudflare DNS](https://vercel.com/docs/projects/domains/working-with-dns)).
   - Do **not** manually add `api` until step 4.
4. In `wrangler.jsonc`, add:

```jsonc
"routes": [
  { "pattern": "api.kamr.app", "custom_domain": true }
]
```

5. Run `npx wrangler deploy` — Cloudflare creates the `api` DNS record and TLS cert.
6. Set `VITE_API_URL=https://api.kamr.app` in Vercel and redeploy.

Until that migration, use the `workers.dev` URL above — it is fully functional for auth, events, and albums (photos after R2 is enabled).

## Troubleshooting

| Symptom | Cause | Fix |
|---------|--------|-----|
| “Can’t reach server” on live site | API not deployed or wrong `VITE_API_URL` | Deploy worker; set env var; redeploy website |
| `api.kamr.app` hits Vercel | Wildcard `*` DNS on Vercel catches `api` | Add explicit `api` record **or** use workers.dev URL |
| Deploy fails on R2 | R2 not enabled | Enable R2 in dashboard, create bucket, uncomment binding |
| Custom domain deploy fails | Zone not on Cloudflare | Add `kamr.app` zone to Cloudflare first |
