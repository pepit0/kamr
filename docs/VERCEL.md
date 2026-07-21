# Deploy Kamr to Vercel (kamr.app)

The **website** (`website/`) deploys to Vercel. The **API** stays on Cloudflare Workers (`packages/api/`).

## 1. Connect GitHub → Vercel

1. Open [vercel.com/dashboard](https://vercel.com/dashboard) → project **kamr**
2. **Settings** → **Git** → **Connect Git Repository**
3. Choose **GitHub** → `pepit0/kamr`
4. Set **Production Branch** to `main`

### Build settings (should auto-detect from `website/vercel.json`)

| Setting | Value |
|---------|--------|
| **Root Directory** | `website` |
| **Framework Preset** | Vite |
| **Install Command** | `cd .. && pnpm install` |
| **Build Command** | `pnpm build` |
| **Output Directory** | `dist` |

> Important: Root Directory must be `website` so Vercel runs install from the monorepo root (needed for `@kamr/shared`).

## 2. Environment variables

In Vercel → **kamr** → **Settings** → **Environment Variables**:

| Name | Production value | Notes |
|------|------------------|--------|
| `VITE_API_URL` | `https://api.kamr.app` | Your Cloudflare Worker URL (update when API is deployed) |

Apply to **Production**, **Preview**, and **Development**.

## 3. Connect kamr.app domain

1. Vercel → **kamr** → **Settings** → **Domains**
2. Add `kamr.app` and `www.kamr.app`
3. At your domain registrar (where you bought kamr.app), either:

   **Option A — Vercel nameservers (recommended)**  
   Point the domain to Vercel's nameservers shown in the Domains panel.

   **Option B — DNS records**  
   - `kamr.app` → **A** record → `76.76.21.21`  
   - `www.kamr.app` → **CNAME** → `cname.vercel-dns.com`

4. Vercel will issue SSL automatically once DNS propagates.

## 4. Push code to GitHub

Vercel deploys on every push to `main`. Commit and push the latest (including `website/vercel.json`):

```bash
git add .
git commit -m "Add Vercel deployment config"
git push origin main
```

## 5. CLI alternative (optional)

```bash
npx vercel login
cd website
npx vercel link          # link to existing "kamr" project
npx vercel --prod        # manual production deploy
npx vercel domains add kamr.app
```

## 6. Cursor + Vercel MCP

To manage deploys from Cursor, authenticate the Vercel plugin when prompted (**Settings → MCP → Vercel → Authenticate**). The auth dialog timed out earlier — retry when ready.

## Architecture

```
kamr.app          → Vercel (website/dist — landing + /app)
api.kamr.app      → Cloudflare Worker (packages/api) — set up separately
```

After the API is live on Cloudflare, set `VITE_API_URL` in Vercel and redeploy.
