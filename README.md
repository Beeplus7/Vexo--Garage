# Vexo Garage

Car servicing platform — **web**, **app**, and **mobile**.

| | |
|---|---|
| Domain | [vexogarage.co.uk](https://vexogarage.co.uk) |
| Repo | [github.com/Beeplus7/Vexo--Garage](https://github.com/Beeplus7/Vexo--Garage) |
| Backend | Supabase (Postgres + Auth) |
| Hosting target | IONOS VPS `87.106.103.43` (Ubuntu 24.04 + Plesk) |

## Structure

```
apps/web          Next.js (website / web app)
apps/mobile       Expo (iOS / Android)
packages/shared   Shared types & constants
docs/brand        Brand kit HTML
docs/architecture Production architecture HTML
apps/web/public/downloads   Downloadable brand + architecture files
credentials/      Local-only secrets (gitignored)
```

### Brand, architecture & inventory downloads

With the web app running (`npm run dev:web`):

- [/downloads/Vexo-Garage-Brand-Kit-White-With-Main-Logo.html](http://localhost:3000/downloads/Vexo-Garage-Brand-Kit-White-With-Main-Logo.html)
- [/downloads/vexo_x5f_garage_x5f_white_x5f_production_x5f_architecture.html](http://localhost:3000/downloads/vexo_x5f_garage_x5f_white_x5f_production_x5f_architecture.html)
- [/downloads/vexo_x5f_garage_x5f_full_x5f_page_x5f_inventory.html](http://localhost:3000/downloads/vexo_x5f_garage_x5f_full_x5f_page_x5f_inventory.html)
- [/downloads/Vexo-Garage-Full-Api-Inventory-V2.html](http://localhost:3000/downloads/Vexo-Garage-Full-Api-Inventory-V2.html)
- [/downloads/vexo_backend_production_supabase_ready.zip](http://localhost:3000/downloads/vexo_backend_production_supabase_ready.zip)

Parsed summaries:

- `docs/inventory/PAGE_INVENTORY.md` — 38 pages/files
- `docs/inventory/API_INVENTORY.md` — 18 external APIs
- `docs/inventory/API_ACCESS_CHECKLIST.md` — what you must provide vs what I can wire


## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
cp .env.example .env.local   # already filled locally for this machine
```

Secrets live in:

- `.env.local` (root + `apps/web`)
- `apps/mobile/.env`
- `credentials/PROJECT_CREDENTIALS.md` (full local reference — **not** committed)

## Develop

```bash
# Web — http://localhost:3000
npm run dev:web

# Mobile — Expo Dev Tools
npm run dev:mobile
```

## Stack notes

- **Web:** Next.js 16, React 19, Tailwind CSS 4, Supabase JS
- **Mobile:** Expo 57, React Native, Supabase JS
- **DB:** Supabase Postgres + Prisma (`prisma/schema.prisma`) — production national schema pushed
- **Backend package:** `docs/backend/vexo_backend_production_supabase_ready.zip` + full notes in `docs/backend/BACKEND_PRODUCTION.md`
- **API routes:** vehicle, mot, postcode, garages, bookings, accept, proof/upload, shield/approve, passport, boost/stats, keyword/research, social/research, stripe/webhook + BullMQ jobs
- **Deploy compose:** `docker-compose.yml` + `nginx.conf` (Redis, MinIO, web, keyword-layer)


## Deploy (high level)

1. Point `vexogarage.co.uk` DNS A record to `87.106.103.43`
2. Secure VPS (change root password, SSH keys, firewall)
3. Install/configure Plesk + SSL for `vexogarage.co.uk`
4. Build web (`npm run build:web`) and serve via Node/Plesk reverse proxy
5. Ship mobile via Expo EAS when ready

## Security

Never commit `.env*`, `credentials/`, or VPS/DB passwords. Rotate any secret that has been shared outside this machine.
