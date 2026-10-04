# Vexo Garage — Full Page / File Inventory

Source artifact: `docs/inventory/vexo_x5f_garage_x5f_full_x5f_page_x5f_inventory.html`
Download: `/downloads/vexo_x5f_garage_x5f_full_x5f_page_x5f_inventory.html`

Total: **38** pages/files (24 frontend + 12 API + 2 cron + infra/shared).

## Frontend pages

| # | Priority | Route / item | File | Status |
|---|----------|--------------|------|--------|
| 1 | HIGH | `/` | `apps/web/src/app/page.tsx` | Production Ready |
| 2 | HIGH | `/garages/[postcode]` | `apps/web/src/app/garages/[postcode]/page.tsx` | Production Ready |
| 3 | HIGH | `/booking/[id]` | `apps/web/src/app/booking/[id]/page.tsx` | Production Ready |
| 4 | MED | `/garage` (marketing) | `apps/web/src/app/garage/page.tsx` | Production Ready — Marketing |
| 5 | HIGH | `/garage/dashboard` | `apps/web/src/app/garage/dashboard/page.tsx` | Production Ready |
| 6 | MED | `/garage/signup` | `apps/web/src/app/garage/signup/page.tsx` | Production Ready |
| 7 | HIGH | `/passport/[reg]` | `apps/web/src/app/passport/[reg]/page.tsx` | Production Ready |
| 8 | MED | `/widget/[garageSlug]` | `apps/web/src/app/widget/[garageSlug]/page.tsx` | Production Ready |
| 9 | CORE | `/auth/login` | `apps/web/src/app/auth/login/page.tsx` | Production Ready |
| 10 | CORE | `/auth/register` | `apps/web/src/app/auth/register/page.tsx` | Production Ready |
| 11 | HIGH | `/admin` | `apps/web/src/app/admin/page.tsx` | Production Ready |
| 12 | MED | `/admin/garages` | `apps/web/src/app/admin/garages/page.tsx` | Production Ready |
| 13 | HIGH | `/admin/keywords` (marketing) | `apps/web/src/app/admin/keywords/page.tsx` | Production Ready — Marketing + Admin |
| 14 | CORE | `/admin/bookings` | `apps/web/src/app/admin/bookings/page.tsx` | Production Ready |
| 15 | MED | `/how-it-works` (marketing) | `apps/web/src/app/how-it-works/page.tsx` | Production Ready — Marketing |
| 16 | HIGH | `/trust` (marketing) | `apps/web/src/app/trust/page.tsx` | Marketing |
| 17 | HIGH | `/passport-info` (marketing) | `apps/web/src/app/passport-info/page.tsx` | Marketing |
| 18 | HIGH | `/boost` (marketing) | `apps/web/src/app/boost/page.tsx` | Marketing |
| 19 | MED | `/pricing` (marketing) | `apps/web/src/app/pricing/page.tsx` | Marketing |
| 20 | CORE | `/contact` (marketing) | `apps/web/src/app/contact/page.tsx` | Marketing |

### Notes

- **1. /** — Home — Reg + Postcode Finder — National Selector OL M BL SK B L WA E NW SE SW — Your car. Your service. Your choice.
- **2. /garages/[postcode]** — Garage List — 0.3mi Haversine match — A1 Motors £45 Oldham, Kwik Fit London — National
- **3. /booking/[id]** — Booking Detail — Stripe Hold £45 escrow + Shield 30sec video proof + MOT cert + Approve/Dispute 48h + Split £40.50/£7.50
- **4. /garage** — Garage Marketing Landing — I bring 10-20 bookings/mo traffic engine — No upfront fee — 10% only on completion — Free dashboard + widget + guaranteed 10 bookings/mo
- **5. /garage/dashboard** — Garage Dashboard — Accept/Decline/Mark Completed + Upload video proof MinIO + See Boost stats 340 views 12 bookings + Commissions £7.50 + Postcode sequence order
- **6. /garage/signup** — Garage Onboarding — Companies House FREE + Insurance upload + MOT license + Stripe Connect KYC — Automated
- **7. /passport/[reg]** — Vexo Passport — Permanent History — DVSA MOT + service + video hash IPFS — Tied to reg — +£300 resale value — Forever moat — BookMyGarage booking disappears, you permanent
- **8. /widget/[garageSlug]** — Embeddable Widget — <iframe src="vexogarage.co.uk/widget/a1-motors?district=OL8"> — Gives garage web presence — Bookings count as yours — National
- **9. /auth/login** — Auth Login — Customer + Garage — Supabase Auth Email + Phone Magic Link
- **10. /auth/register** — Auth Register — Reg OL08 4AB + Postcode + Phone
- **11. /admin** — Admin Dashboard — Bookings by district OL/M/E/B/L + commissions by district + passports + reminders + bot_market_sequence Week1/2/3 — National
- **12. /admin/garages** — Admin Garages Management — 5→9,000 garages — Verification status — Boost active — Postcode sequencing
- **13. /admin/keywords** — Keyword Intelligence Dashboard — Social + Keyword Double Radar — Research Service garage near me, Repair BMW, Service Tesla, MOT renewed near me — What is selling where MOT £45 Full £189 Tesla £249 BMW £350 Brakes £120 — Deploy 20 resources — Embedded from shopfooty-traffic
- **14. /admin/bookings** — Admin Bookings — Filter by district status pending/accepted/completed — Shield video status — Passport hash
- **15. /how-it-works** — How It Works — Customer pre-pays £45 → Stripe holds → Garage does MOT → Must upload 30sec video proof + MOT cert → Customer sees video clicks Approve 48h escrow → Auto-split £40.50 garage / £7.50 Vexo — Trust flawless
- **16. /trust** — Vexo Shield Trust — Video Proof + 48h Escrow + AI verification plate vs DVLA cert vs DVSA — Eliminates fake MOTs & chargebacks — +£2 Shield fee — Why Flawless?
- **17. /passport-info** — Vexo Passport Info — Permanent digital service history tied to reg — Stored IPFS — +£300 resale value — Buyer scans reg sees full Vexo history — £1 Passport fee — Forever moat
- **18. /boost** — Vexo Boost Engine — Guaranteed 10 bookings/mo via 20-phone VPN farm 185.23.40.13 Manchester/Oldham/London — 72 signals/day/phone — Rank top without AdWords — £199/mo — They can't copy
- **19. /pricing** — Pricing — Old £45 MOT → £4.50 Vexo — New Connect+ £45 MOT → £4.50 base + £2 Shield + £1 Passport = £7.50 per booking (+66%) + £199 Boost monthly — +£9.99 Care subscription
- **20. /contact** — Contact — Support — vexogarage.co.uk — Your car. Your service. Your choice.

## API routes

| # | Priority | Route / item | File | Status |
|---|----------|--------------|------|--------|
| 21 | HIGH | `GET /api/vehicle?reg=OL08` | `apps/web/src/app/api/vehicle/route.ts` | Production Ready |
| 22 | HIGH | `GET /api/mot?reg=OL08` | `apps/web/src/app/api/mot/route.ts` | Production Ready |
| 23 | CORE | `GET /api/postcode?postcode=OL8 4` | `apps/web/src/app/api/postcode/route.ts` | Production Ready |
| 24 | HIGH | `GET /api/garages?postcode=OL8 4&service=MOT&national=true` | `apps/web/src/app/api/garages/route.ts` | Production Ready |
| 25 | HIGH | `POST /api/bookings` | `apps/web/src/app/api/bookings/route.ts` | Production Ready |
| 26 | MED | `POST /api/garages/[id]/accept` | `apps/web/src/app/api/garages/[id]/accept/route.ts` | Production Ready |
| 27 | HIGH | `POST /api/proof/upload` | `apps/web/src/app/api/proof/upload/route.ts` | Production Ready |
| 28 | HIGH | `POST /api/shield/approve` | `apps/web/src/app/api/shield/approve/route.ts` | Production Ready |
| 29 | MED | `POST /api/passport` | `apps/web/src/app/api/passport/route.ts` | Production Ready |
| 30 | HIGH | `GET /api/boost/stats?garage_id=1` | `apps/web/src/app/api/boost/stats/route.ts` | Production Ready |
| 31 | HIGH | `POST /api/keyword/research + GET /api/social/heatmap + GET /api/bot/deployment` | `apps/web/src/app/api/keyword/research/route.ts` | Production Ready |
| 32 | CORE | `POST /api/stripe/webhook` | `apps/web/src/app/api/stripe/webhook/route.ts` | Production Ready |

### Notes

- **21. GET /api/vehicle?reg=OL08** — DVLA Vehicle Enquiry FREE 3k/day → Audi A3 2019 → Cache Redis 24h → Exact quote +10% conversion
- **22. GET /api/mot?reg=OL08** — DVSA MOT History FREE unlimited → Expiry 15 Oct + mileage + advisories → Save mot_history + district OL8 → Reminder AI + Passport — JustPark 1,900 trick
- **23. GET /api/postcode?postcode=OL8 4** — Postcodes.io FREE → LatLng 53.54,-2.11 + district OL8 + area OL + region North West → Seed 3,000 districts Day1 / 1.7m bulk — National
- **24. GET /api/garages?postcode=OL8 4&service=MOT&national=true** — Haversine 0.3mi — A1 Motors Oldham £45 — No unified API MVP Dashboard Accept/Decline — Later TechMan adapter — National sequence Week1 OL+M+BL+SK Week2 B+L+WA Week3 London E+NW+SE+SW
- **25. POST /api/bookings** — Customer Pre-Pays £45 Hold Escrow — stripe.paymentIntents.create amount 4500 capture_method manual → Hold £45 escrow → No money to garage yet → SMS Twilio to garage NEW BOOKING — National
- **26. POST /api/garages/[id]/accept** — Garage Accepts — status accepted → SMS customer Vexo Garage: Your MOT booked at A1 Motors Oldham
- **27. POST /api/proof/upload** — Shield Mandatory Video Proof — MinIO S3 vexo-proofs bucket or Supabase Storage — 30sec video + MOT cert photo — video_proofs table ai_verified — +£2 Shield — BookMyGarage doesn't have
- **28. POST /api/shield/approve** — 48h Escrow + Approve — Customer sees video on /booking/[id] → Approve/Dispute 48h → If Approve capture + transfers 4050 garage 90% / 750 Vexo 10%+Shield+Passport → If Dispute cancel auto-refund — Garage never pays manually — Automated flawless
- **29. POST /api/passport** — Permanent History — On completed → IPFS hash = DVSA MOT + service + video hash → tied to reg → +£300 resale +£1 fee — Moat forever
- **30. GET /api/boost/stats?garage_id=1** — Traffic from 20-phone VPN farm 185.23.40.13 MAN + 87.106.103.43 LON — 72/day/phone = 43,200/mo national — Guaranteed 10 bookings/mo or refund — Proof for £199/mo — Already LIVE in shopfooty-traffic v2.5 :4001 KEEP LIVE
- **31. POST /api/keyword/research + GET /api/social/heatmap + GET /api/bot/deployment** — Keyword Layer Double Radar — Google Keyword Planner FREE + pytrends + Facebook Marketplace + Instagram Hashtags + TikTok + Twitter/X + YouTube + eBay Motors — What is selling where — Total Selling Score = Keyword + Social — Deploy 20 resources data-driven — Already LIVE shopfooty-traffic v2.5 :4001 KEEP LIVE
- **32. POST /api/stripe/webhook** — Stripe Webhook — payment_intent.succeeded / payment_intent.payment_failed — Update bookings + commissions

## Cron / jobs

| # | Priority | Route / item | File | Status |
|---|----------|--------------|------|--------|
| 33 | HIGH | `BullMQ reminders:cron` | `apps/web/src/jobs/reminders.ts` | Production Ready |
| 34 | HIGH | `BullMQ bot_market:cron` | `apps/web/src/jobs/bot-market.ts` | Production Ready |

### Notes

- **33. BullMQ reminders:cron** — Daily 02:00 UTC — Query mot_history expiry NOW()+30/7/1 days group by district — Twilio SMS £0.04 + SendGrid — Your MOT due 15 Oct — Book vexogarage.co.uk/OL8 — Branded link — Auto-booking — Recurring yearly — JustPark 1,900 extra/mo per region x10 = 19,000 extra/mo national
- **34. BullMQ bot_market:cron** — Daily 02:00 UTC — Already LIVE in shopfooty-traffic v2.5 :4001 KEEP LIVE — Assigns phone_id → vpn_ip Manchester/London/Birmingham → search_term + service high-selling → signals 72/day — 20 phones 4/20 max reads bot_market_sequence and executes — Feedback loop

## Mobile / shared / infra

| # | Priority | Route / item | File | Status |
|---|----------|--------------|------|--------|
| 35 | MED | `apps/mobile — Expo` | `apps/mobile/src/app/index.tsx` | Production Ready |
| 36 | CORE | `packages/shared — Types` | `packages/shared/src/types/index.ts` | Production Ready |
| 37 | HIGH | `docker-compose.yml + nginx.conf + Dockerfile` | `docker-compose.yml + nginx/nginx.conf + Dockerfile` | Production Ready |
| 38 | HIGH | `Prisma schema + Supabase` | `supabase/schema.prisma — DATABASE_URL env` | Production Ready |

### Notes

- **35. apps/mobile — Expo** — Mobile App — Same flows Reg+Postcode Finder + National Selector + Garages 0.3mi + Booking Hold + Shield video Approve + Garage dashboard + Passport + Keywords — White + Orange + Brown — Mobile first
- **36. packages/shared — Types** — Shared Types — Garage, Booking, Vehicle, MOTHistory, VideoProof, Passport, Commission, Reminder, BotMarketSequence, KeywordResearch, SocialResearch — Shared web+mobile
- **37. docker-compose.yml + nginx.conf + Dockerfile** — VPS 87.106.103.43 Ubuntu 24.04 6vCore 8GB 240GB NVMe — Redis 7 + MinIO + Next.js :3000 + API :4000 + Keyword Layer :4001 + Nginx reverse proxy api.vexogarage.co.uk → :4000 keyword.vexogarage.co.uk → :4001 vexogarage.co.uk → :3000 — SSL FREE Let's Encrypt
- **38. Prisma schema + Supabase** — 14 tables — postcodes, garages, customers, bookings, vehicles, mot_history, video_proofs, passports, commissions, reminders, bot_market_sequence, keyword_research, social_research, social_trends — National + Postcode sequencing
