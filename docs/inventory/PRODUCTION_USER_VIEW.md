# Production user view — scorecard

Soft-production surface on DesignEmbed + host split. No native rebuild of 38 pages.

## Hosts

| Host | Role | Home |
|------|------|------|
| `vexogarage.co.uk` | Marketing | Design 01 |
| `app.vexogarage.co.uk` | App | Design 38 |

Sign-in / sign-up / garages / booking always on **app** (marketing 307s).

## Live for users

- Marketing + app design pages with AOS / typography enhance
- CTA bridge → real routes
- Auth gate: Google, email confirm, phone Verify (Twilio trial limits until upgrade)
- Onboarding + SiteChrome on auth/onboarding
- Branded `not-found` / `error`
- Production lockdown: `/design`, `/dev/*`, `/sitemap-preview` → 404; `/admin/*` allowlisted
- Host-aware sitemap / robots
- DB via Supabase **pooler** `aws-0-eu-west-1.pooler.supabase.com:6543` (VPS has no IPv6 to direct `db.*:5432`)
- PM2 starts with `apps/web/.env.pm2` so Prisma sees the pooler URL (shell env overrides `.env.local`)
- Demo OL8 garages seeded (`ids` 1–3): `POST /api/garages/seed` + header `x-vexo-admin` (secret on VPS `/root/.vexo-admin-secret`)

## Waiting on you

1. Twilio full account (+ From number) → SMS OTP to any UK number  
2. Matching Stripe **publishable** key / live keys when ready  
3. DVLA / DVSA live keys  
4. `ADMIN_EMAILS` (comma emails) and/or keep `VEXO_ADMIN_SECRET` for admin + seed  

## Smoke

- Marketing `/` → `01.html`  
- App `/` → `38.html`  
- `/auth/login` on marketing → app  
- `/api/health` → `database: connected`  
- `/api/garages?postcode=OL8` → seeded rows when DB up  
