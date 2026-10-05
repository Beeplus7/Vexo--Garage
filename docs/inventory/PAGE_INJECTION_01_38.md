# Page injection 01 → 38

## Host split

| Host | `/` design | Role |
|------|------------|------|
| `vexogarage.co.uk` / `www` | **01** Hero marketing | Marketing pages |
| `app.vexogarage.co.uk` | **38** App home / finder | Product + auth |
| `localhost:3001` | **38** | Local = app host |

Marketing host redirects app-only paths (`/auth`, `/garages`, `/booking`, `/admin`, …) → `https://app.vexogarage.co.uk…`

## Live wiring (latest designs win)

| Design | Route | Host |
|--------|-------|------|
| 01 | `/` (marketing) | marketing |
| 02 | `/garages` | app |
| 05 | `/passport-info` | both |
| 08 | `/how-it-works` | marketing |
| 09 | `/trust` | marketing |
| 10 | `/pricing` | both |
| 11 | `/garage`, `/boost` | both |
| 15 | `/garages/[postcode]` | app |
| 16 | `/garage/[slug]` | app |
| 21 | `/admin/dashboard`, `/admin/keywords` | app |
| 23 | `/terms` | both |
| 24 | `/privacy` | both |
| 25 | `/contact` | marketing |
| 26 | `/reviews` | marketing |
| 27 | `/services` | marketing |
| 28 | `/booking/success` | app |
| 29 | `/booking/[id]` | app |
| 30 | `/passport/[reg]` | app |
| 31 | `/widget/[garageSlug]` | app |
| 32 | `/garage/signup` | app |
| 33 | `/garage/dashboard` | app |
| 34 | `/admin`, `/admin/garages`, `/admin/bookings` | app |
| 35 | `/legal` | both |
| 36 | `/sitemap-preview` | both |
| 37 | `/dev/api-routes` | app |
| 38 | `/` (app) | app |

## Archive / superseded

View any HTML at `/design/[n]` (1–38). Superseded drafts kept: 3, 4, 6, 7, 12, 13, 14, 17, 19, 20, 22.

Index: `/design`

## Gaps closed this pass

- Marketing home was incorrectly showing design 38 → now host-aware 01 vs 38
- Missing archive viewer for unused designs → `/design/[n]`
- Product routes hittable on apex without bounce → middleware redirect to app host
- Nginx missing `X-Forwarded-Host` → added in `deploy/nginx-vexo-garage.conf`
- Catalog + manifest synced (`design-catalog.ts`, `pages-manifest.json`)
