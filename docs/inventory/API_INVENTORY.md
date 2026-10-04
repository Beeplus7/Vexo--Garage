# Vexo Garage — Full API Inventory V2

Source artifact: `docs/inventory/Vexo-Garage-Full-Api-Inventory-V2.html`
Download: `/downloads/Vexo-Garage-Full-Api-Inventory-V2.html`

Total external integrations: **18**

| # | Cost | API | Endpoint | Used in | Live? |
|---|------|-----|----------|---------|-------|
| 1 | FREE | DVLA Vehicle Enquiry API | `driver-vehicle-licensing.api.gov.uk` | GET /api/vehicle?reg=OL08 | No |
| 2 | FREE | DVSA MOT History API | `beta.check-mot.service.gov.uk/trade` | GET /api/mot?reg=OL08 | No |
| 3 | FREE | Postcodes.io API | `api.postcodes.io/postcodes/OL8 4AB` | GET /api/postcode | No |
| 4 | PAID | Stripe Connect API | `api.stripe.com/v1/payment_intents + transfers + accounts` | POST /api/bookings, POST /api/shield/approve, Stripe webhook | No |
| 5 | FREEMIUM | Google Maps API | `maps.googleapis.com` | /garages/[postcode] map view | No |
| 6 | FREEMIUM | Supabase API | `vdtyzqzdakfckpcjxxpi.supabase.co` | All routes — Core data layer | No |
| 7 | PAID | Twilio SMS API | `api.twilio.com` | reminders:cron + bookings | No |
| 8 | FREEMIUM | SendGrid Email API | `api.sendgrid.com/v3/mail/send` | reminders:cron | No |
| 9 | FREE | Companies House API | `api.company-information.service.gov.uk` | /garage/signup + admin/garages | No |
| 10 | FREE | Google Keyword Planner API via Google Ads API | `googleads.googleapis.com` | POST /api/keyword/research — Already LIVE | Yes (shopfooty v2.5) |
| 11 | FREE | Google Trends API via pytrends | `trends.google.com/trends/api` | POST /api/keyword/research + GET /api/social/heatmap — Already LIVE | Yes (shopfooty v2.5) |
| 12 | OPTIONAL | SerpAPI / ValueSERP API | `serpapi.com / api.valueserp.com` | GET /api/social/heatmap optional | No |
| 13 | FREE | Facebook Marketplace Data API | `Graph API — Marketplace` | POST /api/social/research — Already LIVE | Yes (shopfooty v2.5) |
| 14 | FREE | Social Hashtag Search API | `Instagram Graph + Facebook Hashtag` | POST /api/social/research — Already LIVE | Yes (shopfooty v2.5) |
| 15 | FREE | Short Video Trending API | `TikTok Creative Center` | POST /api/social/research — Already LIVE | Yes (shopfooty v2.5) |
| 16 | FREEMIUM | Microblog Search API | `X / Twitter API v2` | POST /api/social/research — Already LIVE | Yes (shopfooty v2.5) |
| 17 | FREE | Video Platform Data API | `YouTube Data API v3` | POST /api/social/research — Already LIVE | Yes (shopfooty v2.5) |
| 18 | OPTIONAL | Marketplace Scraper via Apify | `api.apify.com` | POST /api/social/research optional — Already LIVE | Yes (shopfooty v2.5) |

## 1. DVLA Vehicle Enquiry API (FREE)

- **Endpoint:** `driver-vehicle-licensing.api.gov.uk`
- **Cost:** £0 — 3k/day — FREE 3k/day
- **Description:** Reg OL08 4AB → Audi A3 2019 — make, model, year, colour, fuel, engine CC. Exact quote not estimate. +10% conversion lift.
- **Flow:** Exact vehicle data → instant accurate pricing
- **Used in:** GET /api/vehicle?reg=OL08
- **Extra:** Cache: Redis 24h; Validation: UK reg regex + DVLA check

## 2. DVSA MOT History API (FREE)

- **Endpoint:** `beta.check-mot.service.gov.uk/trade`
- **Cost:** £0 — Unlimited — FREE unlimited
- **Description:** Reg OL08 4AB → MOT expiry 15 Oct + mileage + advisories + fails. Save mot_history + district OL8. Powers Reminder AI + Passport permanent + £300 resale moat.
- **Flow:** JustPark 1900 trick x10 regions = 19,000 extra bookings/mo national
- **Used in:** GET /api/mot?reg=OL08
- **Extra:** Table: mot_history; Triggers: reminders + passport

## 3. Postcodes.io API (FREE)

- **Endpoint:** `api.postcodes.io/postcodes/OL8 4AB`
- **Cost:** £0 — Bulk FREE — FREE bulk 1.7m postcodes
- **Description:** Postcode OL8 4AB → Lat 53.54 Lng -2.11 + district OL8 + area OL + region North West. Seed postcodes table 3000 districts Day1 / 1.7m Month2.
- **Flow:** National matching + bot market sequencing — Haversine 0.3mi radius
- **Used in:** GET /api/postcode
- **Extra:** Seed: 3000 districts Day1 fast; Matching: 0.3mi garage proximity

## 4. Stripe Connect API (PAID)

- **Endpoint:** `api.stripe.com/v1/payment_intents + transfers + accounts`
- **Cost:** 1.5% +20p — 1.5% +20p — Escrow
- **Description:** Option B You Chose. Customer pre-pays £45 MOT → Stripe holds escrow capture_method manual → Garage Completed + Must upload 30sec video + MOT cert → Customer Approve 48h escrow → Auto-split.
- **Flow:** £40.50 garage 90% / £7.50 Vexo ( £4.50 base 10% + £2 Shield + £1 Passport ) — Automated
- **Used in:** POST /api/bookings, POST /api/shield/approve, Stripe webhook
- **Extra:** Mode: Test first then live; Flow: manual capture → transfer

## 5. Google Maps API (FREEMIUM)

- **Endpoint:** `maps.googleapis.com`
- **Cost:** £200 free/mo covered — £200 free/mo then pay
- **Description:** Garage map + distance 0.3mi + place autocomplete. Core UX for /garages/[postcode] map view with markers and distance filtering.
- **Flow:** Autocomplete → Geocode → 0.3mi Haversine match → Map pins
- **Used in:** /garages/[postcode] map view
- **Extra:** Covered by free tier Month1-6; Services: Maps + Places + Distance

## 6. Supabase API (FREEMIUM)

- **Endpoint:** `vdtyzqzdakfckpcjxxpi.supabase.co`
- **Cost:** $0-25/mo — FREE tier then $25/mo
- **Description:** Primary DB: 14 tables — postcodes, garages, customers, bookings, vehicles, mot_history, video_proofs, passports, commissions, reminders, bot_market_sequence, keyword_research, social_research, social_trends. Auth Email + Phone Magic Link. Storage for video proofs alternative to MinIO.
- **Flow:** Postgres + Auth + Storage — Used everywhere
- **Used in:** All routes — Core data layer
- **Extra:** Auth: Magic Link; Storage: video_proofs bucket

## 7. Twilio SMS API (PAID)

- **Endpoint:** `api.twilio.com`
- **Cost:** £0.04/SMS ~£40/mo 1k — £0.04 per SMS
- **Description:** Reminder AI BullMQ cron daily 02:00 UTC — MOT due 30/7/1 days. SMS: Your MOT due 15 Oct - Book vexogarage.co.uk/OL8 - Your car. Your service. Your choice. + NEW BOOKING SMS to garage + Video proof ready SMS.
- **Flow:** Cron → Query mot_history expiry → Queue SMS
- **Used in:** reminders:cron + bookings
- **Extra:** Schedule: 30d / 7d / 1d; Volume: ~1k SMS/mo = £40

## 8. SendGrid Email API (FREEMIUM)

- **Endpoint:** `api.sendgrid.com/v3/mail/send`
- **Cost:** FREE 100/day — FREE 100/day then $15/mo
- **Description:** Email reminders MOT due — Receipts — Garage welcome sequence. Transactional templates with branding.
- **Flow:** MOT due → Email + SMS dual channel
- **Used in:** reminders:cron
- **Extra:** Free tier covers early stage; Templates: 3 transactional

## 9. Companies House API (FREE)

- **Endpoint:** `api.company-information.service.gov.uk`
- **Cost:** £0 — 600/5min — FREE 600/5min
- **Description:** KYC verification — Check garage company number — Validate limited company exists — Directors, status, incorporation date. Fraud prevention.
- **Flow:** Garage signup → Company No → Verify active status
- **Used in:** /garage/signup + admin/garages
- **Extra:** Rate: 600 per 5 min; Check: company_status = active

## 10. Google Keyword Planner API via Google Ads API (FREE)

- **Endpoint:** `googleads.googleapis.com`
- **Cost:** £0 — 10k/day — FREE 10k/day — Needs Ads account
- **Description:** Research keywords by area — Service garage near me, Repair my BMW, Service my Tesla, MOT renewed near me. Volume by district M1 1200/mo, M20 Tesla 210/mo rising +20%, OL8 MOT 540/mo. CPC £1.20-£3.50. Determines which region triggers more keywords.
- **Flow:** Which postcode to deploy 20 resources — data-driven expansion
- **Used in:** POST /api/keyword/research — Already LIVE
- **Extra:** Live: shopfooty-traffic v2.5 :4001; Data: Volume + CPC by district
- **Status:** Already LIVE in shopfooty-traffic v2.5 `:4001` — keep live

## 11. Google Trends API via pytrends (FREE)

- **Endpoint:** `trends.google.com/trends/api`
- **Cost:** £0 — Unlimited — FREE unlimited
- **Description:** Trend over time — Service my Tesla rising M20 Didsbury + SK9 Wilmslow +20% — MOT seasonal trends. Seasonality mapping.
- **Flow:** Trend spike → Deploy resources to rising district
- **Used in:** POST /api/keyword/research + GET /api/social/heatmap — Already LIVE
- **Extra:** Live: shopfooty-traffic v2.5; Use: seasonality + rising queries
- **Status:** Already LIVE in shopfooty-traffic v2.5 `:4001` — keep live

## 12. SerpAPI / ValueSERP API (OPTIONAL)

- **Endpoint:** `serpapi.com / api.valueserp.com`
- **Cost:** $29/mo 5k searches — $29/mo optional
- **Description:** Real Google SERP by location — Search Service garage near me in Manchester M1 → Returns local pack 3 garages — Shows which garages rank — Gap analysis for SEO domination.
- **Flow:** SERP gap → Target low-competition districts
- **Used in:** GET /api/social/heatmap optional
- **Extra:** Optional: $29/mo; Use: Local pack analysis

## 13. Facebook Marketplace Data API (FREE)

- **Endpoint:** `Graph API — Marketplace`
- **Cost:** £0 — 200/hour — FREE 200/hour
- **Description:** What is selling where — Marketplace listings by district OL8 Oldham 120 listings Brakes £120, M1 Manchester 340 listings Full Service £189, E1 London 520 listings Tesla Service £249, M20 Didsbury 80 listings Tesla Service. Volume + price + engagement.
- **Flow:** Listings volume → Demand heatmap by district
- **Used in:** POST /api/social/research — Already LIVE
- **Extra:** Live: shopfooty-traffic; Metric: listings + price median
- **Status:** Already LIVE in shopfooty-traffic v2.5 `:4001` — keep live

## 14. Social Hashtag Search API (FREE)

- **Endpoint:** `Instagram Graph + Facebook Hashtag`
- **Cost:** £0 — FREE
- **Description:** Hashtag volume by location — #MOT 800 posts OL8, #CarService 1.2k posts M1, #TeslaService 3.2k posts M20+SW, #BMWRepair 4.1k posts M1+B1. What is trending visually — Before/after brake photos.
- **Flow:** Hashtag density → Visual demand signal
- **Used in:** POST /api/social/research — Already LIVE
- **Extra:** Live: shopfooty-traffic; Signal: visual proof trending
- **Status:** Already LIVE in shopfooty-traffic v2.5 `:4001` — keep live

## 15. Short Video Trending API (FREE)

- **Endpoint:** `TikTok Creative Center`
- **Cost:** £0 — 1k/day — FREE 1k/day
- **Description:** Trending hashtags — #MOTCheck 2.3m views Manchester M1+OL8, #CarService 1.8m views M1+B1, #TeslaService 890k views London SW+M20, #BMWRepair 1.2m views M1+B1. What is selling virally — Young drivers 18-34.
- **Flow:** Viral views → Young driver intent
- **Used in:** POST /api/social/research — Already LIVE
- **Extra:** Live: shopfooty-traffic; Demo: 18-34 high intent
- **Status:** Already LIVE in shopfooty-traffic v2.5 `:4001` — keep live

## 16. Microblog Search API (FREEMIUM)

- **Endpoint:** `X / Twitter API v2`
- **Cost:** Free 1500/mo then $100 — FREE 1500/mo then $100/mo
- **Description:** Tweet volume by district — MOT due 320 tweets M1, Tesla service 120 tweets M20+SW, BMW repair 90 tweets B1 — Sentiment — What people complain about where.
- **Flow:** Complaint mining → Service opportunity
- **Used in:** POST /api/social/research — Already LIVE
- **Extra:** Live: shopfooty-traffic; Use: sentiment + complaint
- **Status:** Already LIVE in shopfooty-traffic v2.5 `:4001` — keep live

## 17. Video Platform Data API (FREE)

- **Endpoint:** `YouTube Data API v3`
- **Cost:** £0 — 10k units/day — FREE 10k units/day
- **Description:** How to check MOT 450k views Manchester M1+OL8, Tesla service cost 320k views London SW+M20, BMW repair 280k views B1 — What people watch where — Educational demand.
- **Flow:** Watch intent → Service need prediction
- **Used in:** POST /api/social/research — Already LIVE
- **Extra:** Live: shopfooty-traffic; Signal: how-to search
- **Status:** Already LIVE in shopfooty-traffic v2.5 `:4001` — keep live

## 18. Marketplace Scraper via Apify (OPTIONAL)

- **Endpoint:** `api.apify.com`
- **Cost:** $29/mo optional 5k — $29/mo optional 5k listings
- **Description:** Real transactions — MOT £45 120 listings OL8, Full Service £189 340 listings M1, Tesla Service £249 80 listings M20+SW, BMW Repair £350 90 listings B1 — What is actually selling where — Real price validation.
- **Flow:** Scraped sales → True market price by district
- **Used in:** POST /api/social/research optional — Already LIVE
- **Extra:** Optional: $29/mo; Use: Price validation
- **Status:** Already LIVE in shopfooty-traffic v2.5 `:4001` — keep live

## Env template (from inventory Section 8)

```env
# DATABASE / SUPABASE
DATABASE_URL=postgresql://...
SUPABASE_URL=https://vdtyzqzdakfckpcjxxpi.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# STRIPE CONNECT — ESCROW Option B
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# DVLA + DVSA + POSTCODES
DVLA_API_KEY=...
DVSA_API_KEY=...
POSTCODES_IO_BASE=https://api.postcodes.io

# GOOGLE
GOOGLE_MAPS_API_KEY=AIza...
GOOGLE_ADS_API_KEY=...
GOOGLE_ADS_DEVELOPER_TOKEN=...

# COMMUNICATION
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+44...
SENDGRID_API_KEY=SG...

# COMPANIES HOUSE KYC
COMPANIES_HOUSE_API_KEY=...

# SOCIAL INTELLIGENCE — Already LIVE v2.5 :4001 KEEP LIVE
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
INSTAGRAM_APP_ID=...
TIKTOK_API_KEY=...
TIKTOK_CLIENT_KEY=...
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_BEARER_TOKEN=...
YOUTUBE_API_KEY=AIza...

# OPTIONAL SCRAPERS
SERPAPI_API_KEY=...
VALUESERP_API_KEY=...
APIFY_API_KEY=apify_api_...

# BOT MARKET / PHONE FARM
MANCHESTER_CLUSTER_IP=185.23.40.13
LONDON_VPN_IP=87.106.103.43
PHONE_FARM_COUNT=20
BOT_MARKET_SEQUENCE_ENABLED=true

# APP
NEXT_PUBLIC_BASE_URL=https://vexogarage.co.uk
NODE_ENV=production
REDIS_URL=redis://...
```
