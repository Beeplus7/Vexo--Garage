# Production backend integration notes

Source: `vexo_backend_production_supabase_ready.zip` (copied to `docs/backend/` + `/downloads/`).

## Applied to monorepo

- Prisma schema → `prisma/schema.prisma` (fixed invalid field `@index` → `@@index`, mapped `Postcode` → `postcodes`)
- Prisma pinned to **5.22.0** (Prisma 7 rejects `url = env("DATABASE_URL")` in schema)
- `prisma db push` applied to Supabase `vdtyzqzdakfckpcjxxpi`
- All 12 API routes + 2 BullMQ jobs + lib clients + docker/nginx overlaid
- Redis wrapper falls back to in-memory cache if Redis is down locally
- Stripe client is lazy so missing keys do not crash imports
- Typecheck clean for `@vexo-garage/web`

## Still required for full live money engine

Same as API checklist: Stripe, DVLA, DVSA, Twilio, SendGrid, Supabase anon/service JWT, Redis on VPS, MinIO (or use `video_proofs` Supabase bucket already created).

## Commands

```bash
npm run db:generate
npm run db:push
npm run dev:web
# optional local redis/minio
docker compose up redis minio -d
```
