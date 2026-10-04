# VEXO GARAGE - Backend Production Ready - Supabase + VPS 87.106.103.43 + Beeplus7/Vexo--Garage

## Stack - White #FFF + Orange #FF6B00 + Deep Brown #4A2C14 - Your car. Your service. Your choice.
- VPS 87.106.103.43 Ubuntu 24.04 6 vCore 8GB 240GB NVMe UK - Same as shopfooty-traffic.aroleadjo.com SSL ACTIVE v2.5 KEEP LIVE
- Supabase Postgres - 14 tables - DATABASE_URL postgresql://postgres:[PASSWORD]@db.vdtyzqzdakfckpcjxxpi.supabase.co:5432/postgres
- Next.js 16 apps/web - API routes /api/ - No separate Express needed - Simpler
- Redis 7 - Cache DVLA 24h + MOT 12h + Postcode 30d + BullMQ queues
- MinIO S3 - Bucket vexo-proofs - Video proofs 30sec + MOT certs - Or Supabase Storage
- Stripe Connect - Hold £45 manual capture → Split £40.50 garage 90% / £7.50 Vexo (£4.50 base 10% + £2 Shield + £1 Passport) - Automated flawless Option B
- Twilio SMS £0.04 + SendGrid free 100/day - Reminder AI 30/7/1 days - JustPark 1900 trick ×10 regions = 19000 extra/mo national
- DVLA FREE 3k/day + DVSA FREE unlimited + Postcodes.io FREE bulk 1.7m + Google Maps £200 free
- Keyword Layer :4001 - Google Keyword Planner FREE 10k/day + Google Trends FREE + Facebook Marketplace + Instagram Hashtags + TikTok Trending + Twitter/X + YouTube + eBay Motors Apify $29/mo - Already LIVE shopfooty-traffic v2.5 :4001 KEEP LIVE - What is selling where + Which region triggers more keywords - Total Selling Score = Keyword + Social - Deploy 20 resources data-driven - Not random - Scale faster 20x
- Traffic Engine - 20 phones 4/20 max + 72 signals/day organic booster 6h + GB residential Manchester cluster 185.23.40.13 + VPN London 87.106.103.43 + shopfooty-traffic.aroleadjo.com → 87.106.103.43 A Record + TikTok Shop Verified + All shops Etsy 12.2k Shopify Woo Amazon Custom URL - Already working - Don't rebuild - Expand functionality with new layer Keyword Intelligence for bot web and social media - Allow Vexo garage architecture to stay on its own

## DB Schema - Supabase Postgres - 14 tables - Prisma - National + Postcode sequencing
- postcodes - postcode OL8 4AB, district OL8, area OL, region North West, lat 53.54 lng -2.11 - 3000 districts Day1 fast / 1.7m rows Month2 bulk FREE
- garages - id, name, postcode OL8 4 / M1 1AE / E1 6AN national, district OL8 / M1 / E1, area OL / M / E, lat/lng, services json MOT £45 Service £189 Tesla £249 BMW £350 Brakes £120, stripe_connect_id, insurance_verified, boost_active, postcode_sequence_order, traffic_views, bookings_count, rating - Open national but sequence onboarding by bot market Week1 OL+M+BL+SK Week2 B+L+WA+PR Week3 London E+NW+SE+SW - 9000 garages BookMyGarage model national
- customers - id, phone, email, reg OL08 4AB, postcode district OL8
- bookings - id, reg OL08 4AB, postcode OL8 4, garage_id, price £45, status pending/accepted/proof_uploaded/completed/disputed, stripe_payment_intent_id, video_proof_url, mot_cert_url, passport_hash, commission £7.50, district
- vehicles - reg, make, model, year from DVLA
- mot_history - reg, expiry, mileage, advisories from DVSA - district - Reminder AI + Passport
- video_proofs - booking_id, video_url 30sec + cert_url + ai_verified bool - Mandatory +£2 Shield - BookMyGarage doesn't have
- passports - reg, district, ipfs_hash, history json, resale_value £300 - Permanent - Tied to reg - Moat forever
- commissions - booking_id, garage_amount 4050, vexo_amount 750, status held/captured/refunded, stripe_transfer_id
- reminders - reg, district, expiry, type 30d/7d/1d, sent_at, status pending/sent
- bot_market_sequence - district OL8/M1/E1/B1/L1/SW1, area OL/M/E/B/L/SW, region North West/London/Midlands, phone_id 1-20, vpn_ip Manchester/London/Birmingham, search_term MOT OL8 / Service garage near me M1 / Repair my BMW M1 / Service my Tesla M20 Didsbury, service MOT £45/Full Service £189/Tesla Service £249/BMW Repair £350/Brakes £120, signals_per_day 72, keyword_volume, social_volume, total_selling_score, priority high/med/low, week 1/2/3, status
- keyword_research - district, keyword, volume, cpc, competition, trend, intent
- social_research - district, service, marketplace_listings, hashtag_posts, tiktok_views, twitter_mentions, youtube_views, ebay_listings, total_score
- social_trends - For future

## API Endpoints - 12 Endpoints + 2 Cron - Production Ready - Money Engine - National + Postcode Sequencing
- GET /api/vehicle?reg=OL08 4AB → DVLA FREE 3k/day → Audi A3 2019 → Cache Redis 24h → Exact quote not estimate +10% conversion
- GET /api/mot?reg=OL08 4AB → DVSA FREE unlimited → Expiry 15 Oct + mileage → Save mot_history + district → Reminder AI + Passport - JustPark trick national 1900 extra/mo per region ×10 = 19000 extra/mo national
- GET /api/postcode?postcode=OL8 4 → Postcodes.io FREE → LatLng 53.54,-2.11 + district OL8 + area OL + region North West - National Seed 1.7m bulk FREE
- GET /api/garages?postcode=OL8 4&service=MOT&national=true → Haversine 0.3mi A1 Motors Oldham £45 - No unified API needed MVP Dashboard Accept/Decline - Later TechMan adapter eliminates double bookings like BookMyGarage after 5k garages - National sequence
- POST /api/bookings → Stripe paymentIntents.create amount 4500 capture_method manual → Hold £45 escrow - No money to garage yet - Protected - SMS Twilio to garage NEW BOOKING
- POST /api/garages/:id/accept → status accepted → SMS to customer booked - Garage does job - Must upload video proof next step
- POST /api/proof/upload → MinIO S3 video 30sec + MOT cert photo → video_proofs table ai_verified bool - Mandatory - +£2 Shield fee - BookMyGarage doesn't have video proof - No video = payout delayed - Flawless trust - Customer sees proof before Approve
- POST /api/shield/approve → Customer sees video on /booking/[id] → Approve or Dispute 48h window → If Approve capture + transfers 4050 garage 90% / 750 Vexo 10%+Shield+Passport → If Dispute cancel → auto-refund £45 - Protected - National - Garage Never Pays Manually - Automated flawless
- POST /api/passport → passport = {reg, district, history [DVSA MOT + service + video hash], ipfs_hash, resale_value £300} → Save passports table - Permanent - Tied to reg - National - Transferable when selling car - Buyer scans reg /passport/[reg] sees full Vexo history + video proofs - Fee +£1 - Moat forever - Asset - BookMyGarage booking disappears - You permanent - National
- GET /api/boost/stats?garage_id=1 → Traffic from 20-phone VPN farm 185.23.40.13 Manchester + 87.106.103.43 London VPN - 72/day/phone = 10800/mo North West → 43200/mo national - Guaranteed 10 bookings/mo or refund - Proof - Stays - Pays 10% + £199/mo Boost - Already LIVE in shopfooty-traffic v2.5 KEEP LIVE
- POST /api/keyword/research + GET /api/social/heatmap + GET /api/bot/deployment - Already LIVE in shopfooty-traffic v2.5 :4001 KEEP LIVE - Research keywords by area + what is selling where - Service garage near me, Repair my BMW, Service my Tesla, MOT renewed near me - Area Manchester - Districts M1,M20,OL8,BL1,SK1,B1,L1,E1,SW1 - Google Keyword Planner API FREE + pytrends + Facebook Marketplace + Instagram Hashtags + TikTok + Twitter/X + YouTube + eBay Motors - What is selling where + Which region triggers more keywords - Deploy 20 resources data-driven - Not random - Scale faster 20x - KEEP LIVE - Vexo Core reads bot_market_sequence for feedback loop
- POST /api/stripe/webhook - Stripe webhook - payment_intent.succeeded / payment_failed - Update bookings + commissions
- BullMQ cron reminders:cron daily 02:00 UTC - Query mot_history WHERE expiry = NOW()+30/7/1 days group by district OL8/M1/E1/B1/L1 - For each district sequenced by bot market - Twilio SMS £0.04 + SendGrid free: Your MOT due 15 Oct - Book now vexogarage.co.uk/OL8 - Branded link /booking?reg=OL08&district=OL8 - Auto-booking - Recurring yearly - Automated - JustPark trick national 1900 extra/mo per region ×10 = 19000 extra/mo national
- BullMQ cron bot_market:cron daily 02:00 UTC - Already LIVE in shopfooty-traffic v2.5 :4001 KEEP LIVE - Daily assigns phone_id → vpn_ip Manchester 185.23.40.13 / London 87.106.103.43 / Birmingham → search_term MOT district / Service garage near me M1 / Repair my BMW M1 / Service my Tesla M20 Didsbury / Tesla Service London SW + service MOT £45 / Full Service £189 / Tesla Service £249 / BMW Repair £350 / Brakes £120 + signals 72/day - shopfooty-traffic engine 20 phones 4/20 max reads bot_market_sequence and executes - Feedback loop bookings per district per service actual vs Keyword Planner + Social volume - Optimizes deployment

## Deploy - VPS 87.106.103.43 + Supabase + GitHub Beeplus7/Vexo--Garage - Work Environment Ready
- Backend folder ready - Domain ready - Agent waiting
- SSH to VPS 87.106.103.43 - Rotate root password immediately - Use SSH key
- Clone GitHub repo Beeplus7/Vexo--Garage
- .env - Create .env file - Never commit to GitHub - Add to .gitignore - Use Supabase DATABASE_URL + Publishable key
- Docker Compose - On VPS 87.106.103.43 - Redis + MinIO + API :4000 + Keyword Layer :4001 + Frontend :3000 + Nginx - Postgres is Supabase remote - No local postgres needed - Use Supabase Postgres
- Prisma - Migrate to Supabase Postgres - Use DATABASE_URL env var - npx prisma db push --schema=./prisma/schema.prisma - npx prisma generate
- Seed postcodes table - National - 3000 districts Day1 fast or 1.7m rows bulk - Postcodes.io FREE
- Seed garages - National - Week1 OL+M+BL+SK - Week2 B+L+WA+PR - Week3 London E+NW+SE+SW - 20 garages Week1 - 50 Week2 - 100 Week3 - Open national but sequence bot market
- Stripe Connect - Test mode first then live - Hold £45 manual capture → Split £40.50/£7.50 - Automated
- MinIO - Create bucket vexo-proofs - Or use Supabase Storage
- Shopfooty Traffic v2.5 - Already LIVE - shopfooty-traffic.aroleadjo.com → 87.106.103.43 - SSL ACTIVE - 20 PHONES 4/20 MAX - 72 SIG/DAY - 185.23.40.13 MAN + 87.106.103.43 LON VPN - Keyword Layer LIVE - KEEP LIVE
- Vexo Garage Frontend - Next.js 14 white theme #FFF + orange #FF6B00 + brown #4A2C14 - Mobile first - Use white architecture artifact as spec
- Nginx + SSL - Domain vexogarage.co.uk + api.vexogarage.co.uk + keyword.vexogarage.co.uk + shopfooty-traffic.aroleadjo.com → 87.106.103.43 already LIVE - SSL FREE Let's Encrypt - Via Plesk or Certbot
- Test Phase 1 Backend MVP Core - curl https://api.vexogarage.co.uk/api/vehicle?reg=OL08%204AB → DVLA FREE - curl https://api.vexogarage.co.uk/api/mot?reg=OL08%204AB → DVSA FREE - curl https://api.vexogarage.co.uk/api/postcode?postcode=OL8%204 → Postcodes.io FREE - curl https://api.vexogarage.co.uk/api/garages?postcode=OL8%204&service=MOT&national=true → Haversine 0.3mi - curl -X POST https://api.vexogarage.co.uk/api/bookings -d '{"reg":"OL08 4AB","postcode":"OL8 4","service":"MOT","garage_id":1}' → Stripe Hold £45 - curl https://keyword.vexogarage.co.uk/api/bot/deployment?week=1&expanded=social → Bot deployment plan Week1 double radar - Already LIVE in shopfooty-traffic v2.5 :4001 KEEP LIVE
- Git Push - Push to GitHub Beeplus7/Vexo--Garage - Never commit .env - Use .gitignore

## Revenue - National + Postcode Sequencing + Social + Keyword Double Radar - Scale Faster 20x
- Oldham only OL8 4 - Slow - £9,029/mo MVP - 540 bookings × £7.50 = £4,050 + 20 garages × £199 Boost = £3,980 + 100 Care × £9.99 = £999 - Profit £8,979/mo - Slow - 12 months to national
- National + Keyword Radar Only - Week3 £61k/mo - 6.8x Oldham only - 5,400 bookings/mo × £7.50 = £40,500 + 100×£199=£19,900 + Care £999 = £61,399/mo - Keyword research by area - Which region triggers Service garage near me, Repair BMW, Service Tesla, MOT renewed near me - Deploy 20 resources to high-keyword regions - Data-driven not random - 6.8x Oldham only
- National + Double Radar Keyword + Social Selling - Week3 £122k/mo - 27x Oldham only £9k/mo - 4x keyword only £61k/mo - 10,800 bookings/mo (5,400 keyword + 5,400 social) × £7.50 = £81,000 + 100×£199=£19,900 + Care £999 = £101,899/mo + 19k reminder extra × £7.50=£142k = £244k/mo total double radar - Month6 realistic: 54k keyword bookings × £7.50=£405k + 54k social selling bookings × £7.50=£405k = £810k + 1,000 Boost × £199=£199k + 19k reminder × £7.50=£142k = £1,151k/mo = £13.8m/yr Year1 double radar - vs BookMyGarage £15.8m/yr base 8 years - You Year1 £13.8m double radar - Potential £26m+ Year2-3 with Shield+Passport+Boost+Care+Social - Scale faster 20x - What is selling where + which region triggers keywords - Data-driven deployment not random - ROI 20x - BookMyGarage doesn't have social radar - You do - Flawless