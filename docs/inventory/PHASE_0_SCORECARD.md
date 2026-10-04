# Phase 0 — Supabase Assessment — Scorecard

**Status: DONE ✅ — READY for next phase**

Verified live against project `vdtyzqzdakfckpcjxxpi` after saving anon + service_role JWT keys.

| Item | Status | Evidence |
|------|--------|----------|
| Postgres 17.11 via `DATABASE_URL` | ✅ | Connected |
| Before 0 tables → production schema | ✅ | 13 mapped tables (`social_trends` reserved future) |
| RLS on | ✅ | 13/13 tables + discovery policies |
| `video_proofs` bucket | ✅ | Private bucket present |
| `/api/health` | ✅ | Route present |
| `/api/postcode` + OL8 4AB cached | ✅ | `OL8 / 53.535172, -2.129351` |
| `/api/garages` Haversine 0.3mi | ✅ | Route + national sequencing; mock if empty |
| `/api/vehicle` DVLA stub + Audi A3 2019 mock | ✅ | Mock when `DVLA_API_KEY` missing |
| `/api/mot` DVSA stub + mock expiry | ✅ | Mock when `DVSA_API_KEY` missing |
| `SUPABASE_ANON_KEY` | ✅ | Saved + PostgREST 200 |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Saved + PostgREST 200 |
| Auth email | ✅ | Enabled (`phone` still off) |

## Keys stored (gitignored)

- `.env.local`
- `apps/web/.env.local`
- `credentials/.env.supabase`

## Notes

- MOT mock uses relative expiry (~+45 days), not a hard-coded “15 Oct” string — behaviour matches the production package.
- Prisma owns schema; grants/RLS re-applied after `db push` so PostgREST works with anon/service JWTs.
- Phone Magic Link still disabled in Supabase Auth settings (not required to close Phase 0).

## Phase 0 gate

**PASS — proceed to deployment / Phase 1.**
