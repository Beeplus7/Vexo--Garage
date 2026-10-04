# Stripe setup — Vexo Garage

Imported from `Documents/passport-paper` (VisaGuide OS **test** sandbox).

| Item | Value |
|------|--------|
| Account | `acct_1TyEpWKFjjrlm6Pq` (VisaGuide OS sandbox) |
| Mode | **test** (`sk_test_…`) |
| Secret + webhook | `credentials/.env.stripe` + `apps/web/.env.local` (gitignored) |
| Catalog JSON | `credentials/stripe-catalog.json` |
| App constants | `apps/web/src/lib/stripe-catalog.ts` |

## Built in Stripe

- Products + GBP prices: MOT £45, Full Service £189, Tesla £249, BMW £350, Brakes £120, Boost £199/mo, Care £9.99/mo, Shield £2, Passport £1
- Webhook endpoint: `https://app.vexogarage.co.uk/api/stripe/webhook` (`we_1UMyCI…`)
- Events: payment_intent succeeded/failed/canceled, charge.refunded, account.updated, transfer.created, capability.updated
- Connect Express onboarding API: `POST/GET /api/stripe/connect`

## Publishable key gap

`passport-paper` `.env` has `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51Ng…` — **different Stripe account** than `sk_test_51Ty…`.

Server PaymentIntents work with the secret alone. For Stripe.js / Elements on the client, paste the **matching test publishable key** for `acct_1TyEpWKFjjrlm6Pq` from:

Stripe Dashboard → Developers → API keys → Publishable key

into `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local` and `apps/web/.env.local`.

## Money flow

1. `POST /api/stripe/checkout` `{ kind:"booking", ... }` → Checkout Session (manual-capture hold)  
   (or `POST /api/bookings` with `{ checkout: true }`)
2. Customer pays on Stripe → webhook `checkout.session.completed` → booking `held`
3. Garage accepts → job → `POST /api/proof/upload`
4. Customer `POST /api/shield/approve` → capture + Connect transfer to garage

See `docs/backend/STRIPE_CHECKOUT.md`.
