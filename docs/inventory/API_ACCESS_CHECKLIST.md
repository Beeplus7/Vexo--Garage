# API access checklist — what I can do vs what you must provide

Parsed from `Vexo-Garage-Full-Api-Inventory-V2.html`.

## I can source / wire without new keys from you

- **#3 Postcodes.io** — No API key. Base URL public. I can wire GET /api/postcode + seed helpers.
- **#6 Supabase (partial)** — Already have project URL, publishable key, DATABASE_URL in local credentials. I can scaffold schema/client/routes.
- **#11 Google Trends (pytrends)** — No key. Can wire research job against trends.google.com via pytrends.

## Required from you (accounts / keys)

Paste these into `credentials/` or `.env.local` when you have them (you said you rotate often — placeholders are fine until then).

| # | Integration | What to send me |
|---|-------------|-----------------|
| 1 | DVLA Vehicle Enquiry API | Register at UK gov DVLA API; provide `DVLA_API_KEY`. |
| 2 | DVSA MOT History API | Apply for MOT history trade API access; provide `DVSA_API_KEY`. |
| 4 | Stripe Connect | ✅ Test secret + webhook + catalog built from passport-paper (VisaGuide OS sandbox). **Still need matching publishable key** for `acct_1TyEpWK…` (see `docs/backend/STRIPE_SETUP.md`). |
| 5 | Google Maps Platform | GCP project with Maps/Places/Distance Matrix enabled; provide `GOOGLE_MAPS_API_KEY`. |
| 6 | Supabase service role + anon JWT | From Supabase dashboard: `SUPABASE_ANON_KEY` (JWT) and `SUPABASE_SERVICE_ROLE_KEY` (if different from publishable key you already shared). |
| 7 | Twilio SMS | Twilio account + UK number. Provide `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`. |
| 8 | SendGrid Email | SendGrid account. Provide `SENDGRID_API_KEY` (+ verify sender domain for vexogarage.co.uk). |
| 9 | Companies House | Register for API key at developer.company-information.service.gov.uk; provide `COMPANIES_HOUSE_API_KEY`. |
| 10 | Google Ads / Keyword Planner | Google Ads account + developer token. Provide `GOOGLE_ADS_API_KEY` / `GOOGLE_ADS_DEVELOPER_TOKEN` — or confirm reuse from shopfooty-traffic v2.5. |
| 13 | Facebook Marketplace / Graph | Meta app. Provide `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` — or confirm reuse from shopfooty LIVE stack. |
| 14 | Instagram Hashtag (Graph) | Meta/Instagram app access. Provide `INSTAGRAM_APP_ID` (+ token) — or reuse shopfooty. |
| 15 | TikTok Creative Center / API | Provide `TIKTOK_API_KEY` / `TIKTOK_CLIENT_KEY` — or reuse shopfooty. |
| 16 | X / Twitter API v2 | Provide `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_BEARER_TOKEN` — or reuse shopfooty. |
| 17 | YouTube Data API v3 | GCP YouTube Data API enabled; provide `YOUTUBE_API_KEY` — or reuse shopfooty. |

## Optional (skip for MVP money engine)

- **#12 SerpAPI / ValueSERP** — Optional SERP layer. Provide `SERPAPI_API_KEY` or `VALUESERP_API_KEY` if you want it.
- **#18 Apify marketplace scraper** — Optional. Provide `APIFY_API_KEY` if you want scraper path.

## Infra / ops decisions from you

- **Redis** — Provide `REDIS_URL` for BullMQ (reminders + bot_market crons), or approve me installing Redis on the VPS.
- **Shopfooty traffic bridge** — Confirm whether keyword/social APIs stay on shopfooty-traffic v2.5 `:4001` and share how Vexo should call it (base URL + any auth).
- **DNS / SSL** — Point vexogarage.co.uk to `87.106.103.43` when ready to deploy (you said next task is deployment).

## Suggested MVP order (keys first)

1. Supabase service role + anon JWT (if not already complete)
2. Stripe Connect (test keys)
3. DVLA + DVSA
4. Google Maps
5. Companies House
6. Twilio + SendGrid
7. Reuse / share shopfooty keyword+social LIVE credentials
8. Optional scrapers last

## Already on hand locally

- Supabase URL `vdtyzqzdakfckpcjxxpi`
- Supabase publishable key + anon JWT + service_role JWT (local `.env.local` + `credentials/.env.supabase`)
- Postgres `DATABASE_URL` (local credentials; VPS uses eu-west-1 pooler `:6543` + `pgbouncer=true`)
- Domain `vexogarage.co.uk` + SSL live → PM2 `vexo-web` `:3001`
- VPS `87.106.103.43` (Shopfooty `:4001` KEEP LIVE; VisaGuide `:3000`)
- 38 design pages wired in App Router; Twilio SMS helper ready (awaiting keys)
- Next for entrance gate: `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `NEXT_PUBLIC_GOOGLE_CLIENT_ID` + `TWILIO_*`
