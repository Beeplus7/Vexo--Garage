# Open gaps closed — 2026-10-04

No rebuild performed (production stack left as-is). Gaps closed in repo wiring only.

| Gap | Resolution |
|-----|------------|
| Missing `/admin/garages`, `/admin/keywords`, `/admin/bookings` | Wired to design embeds (34 / 21 / 34) |
| Missing `GET /api/social/heatmap` | Added — reads double-radar tables |
| Missing `GET /api/bot/deployment` | Added — allocation read surface; Shopfooty :4001 stays executor |
| Twilio SMS TODOs in bookings / accept / proof / reminders | `lib/twilio.ts` REST helper — no-ops until keys pasted |
| Proof upload storage TODO | Uploads to Supabase `video_proofs` with safe fallback URL |
| Duplicate design HTML (76 files) | Kept `01–38.html` only |
| Duplicate Twilio keys in `.env*` | Deduped; Google OAuth slots kept for entrance gate |
| Missing `robots.ts` / `sitemap.ts` | Added for public marketing routes |
| Inventory path `supabase/schema.prisma` | Symlink → `prisma/schema.prisma` |
| 38 design pages → App Router | Closed earlier; index at `/design` |

## Stripe (2026-10-04)

- Imported test secret + webhook from `Documents/passport-paper` → VisaGuide OS sandbox `acct_1TyEpWK…`
- Created full Vexo product/price catalog + webhook `https://vexogarage.co.uk/api/stripe/webhook`
- Connect Express route: `/api/stripe/connect`
- **Still needed:** matching `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` for `acct_1TyEpWK…` (passport-paper pk is a different account `51Ng…`)

## Intentionally open (need your credentials — not code gaps)

1. **Entrance gate** — Google OAuth + Twilio phone (paste next)
2. Matching Stripe **publishable** key for VisaGuide OS sandbox (+ live keys later)
3. DVLA / DVSA live keys (mocks already production-safe)
4. Optional DNS SANs: `www` / `api` on Let's Encrypt
5. Seed real garages (API mocks when table empty)

## Gate

**Repo gaps closed ✅ — ready for entrance gate credentials.**
