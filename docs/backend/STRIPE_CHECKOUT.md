# Stripe Checkout Sessions — Vexo Garage

Main host: `https://app.vexogarage.co.uk`

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/stripe/checkout` | Create Checkout Session (booking hold / Boost / Care) |
| GET | `/api/stripe/session?session_id=` | Resolve session + booking |
| POST | `/api/bookings` with `{ checkout: true }` | Alias → booking Checkout Session |
| POST | `/api/stripe/webhook` | `checkout.session.completed` → booking `held` |

## Booking escrow (manual capture)

```bash
curl -s https://app.vexogarage.co.uk/api/stripe/checkout \
  -H 'content-type: application/json' \
  -d '{
    "kind":"booking",
    "reg":"OL084AB",
    "postcode":"OL8 4AB",
    "service":"MOT",
    "garageId":"1",
    "customerEmail":"driver@example.com"
  }'
```

Response includes `url` — redirect the customer there.

Success return: `/booking/success?session_id={CHECKOUT_SESSION_ID}`  
Cancel return: `/garages/{district}?cancelled=1`

Flow: Checkout → PaymentIntent **held** (manual capture) → garage accepts → proof upload → `POST /api/shield/approve` captures + Connect transfer.

## Subscriptions

```json
{ "kind": "boost", "garageId": "1", "customerEmail": "garage@example.com" }
{ "kind": "care", "customerEmail": "driver@example.com" }
```

## Webhook events (live)

`checkout.session.completed`, `checkout.session.expired`, payment_intent.*, charge.refunded, subscription.*, account.updated
