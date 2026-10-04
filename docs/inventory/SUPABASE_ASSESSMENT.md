# Supabase assessment — Vexo Garage

Assessed live against project `vdtyzqzdakfckpcjxxpi` using local credentials.

## Verdict

| Check | Result |
|-------|--------|
| Project reachable | Yes |
| Postgres | **PostgreSQL 17.11** — connected with `DATABASE_URL` |
| Auth (GoTrue) | Healthy (`v2.197.0`) |
| Email auth | **Enabled** |
| Phone auth | **Disabled** (inventory wants Magic Link phone — enable in dashboard later) |
| OAuth providers | All off |
| Public schema (before) | **Empty** |
| Public schema (after migration) | **14 tables + helpers + RLS** |
| Storage buckets | `video_proofs` (private) created |
| Auth users | 0 |
| PostgREST with publishable key | **401 Secret API key required** |
| Service role key | **Provided + verified (PostgREST 200)** |
| Anon JWT | **Provided + verified (PostgREST 200)** |
| Phase 0 scorecard | **DONE ✅** — see `PHASE_0_SCORECARD.md` |

## What this means for backend

1. **Database path works now** — server code uses `DATABASE_URL` + `pg` (`apps/web/src/lib/db.ts`).
2. **Supabase JS PostgREST** needs `SUPABASE_SERVICE_ROLE_KEY` and/or legacy `anon` JWT from the dashboard. The `sb_publishable_…` key is fine for Auth health, not for REST root.
3. **Phone Magic Link** must be turned on in Supabase Auth settings when you want SMS login.
4. Schema matches inventory tables: `postcodes`, `garages`, `customers`, `bookings`, `vehicles`, `mot_history`, `video_proofs`, `passports`, `commissions`, `reminders`, `bot_market_sequence`, `keyword_research`, `social_research`, `social_trends`.

## Backend created

- Migration: `supabase/migrations/202610040001_init_vexo_schema.sql` (**applied**)
- DB pool: `apps/web/src/lib/db.ts`
- Supabase clients: `apps/web/src/lib/supabase/{browser,server,admin,env}.ts`
- Services: postcodes, garages, vehicle helpers
- Live API routes:
  - `GET /api/health`
  - `GET /api/postcode?postcode=OL8 4AB` (Postcodes.io + cache)
  - `GET /api/garages?postcode=OL8 4AB&national=true`
  - `GET /api/vehicle?reg=…` (waits on `DVLA_API_KEY`)
  - `GET /api/mot?reg=…` (waits on `DVSA_API_KEY`)

## Still needed from you

1. **Supabase Dashboard → Project Settings → API**
   - `SUPABASE_ANON_KEY` (JWT) if different from publishable
   - `SUPABASE_SERVICE_ROLE_KEY` (secret — server only)
2. Enable **Phone** provider if you want phone Magic Link
3. Later: DVLA / DVSA / Stripe / Twilio / SendGrid keys (see `API_ACCESS_CHECKLIST.md`)
