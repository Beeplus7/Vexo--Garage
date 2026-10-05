# Google Auth — Entrance gate

## Already done in repo / Google Cloud

- OAuth client created (VisaguideOS)
- Origins: `app.vexogarage.co.uk`, `vexogarage.co.uk`, `localhost:3001`
- Redirects: `/auth/callback` + Supabase `/auth/v1/callback`
- Test user: `olabamiji.kolabalogun@gmail.com`
- Keys in `credentials/.env.google` + VPS `.env`

## Supabase Google provider

**Enabled via Management API (2026-10-05):**

- `external_google_enabled = true`
- Client ID/secret from `credentials/.env.google`
- Site URL: `https://app.vexogarage.co.uk`
- Redirect allow list includes app / apex / `localhost:3001` callbacks

Dashboard (if you need to re-check): [Auth → Providers → Google](https://supabase.com/dashboard/project/vdtyzqzdakfckpcjxxpi/auth/providers)

## App routes

| Route | Role |
|-------|------|
| `/auth/login` | Google live · Twilio stub |
| `/auth/register` | Same Google flow (creates user) |
| `/auth/callback` | PKCE code exchange |
| `/auth/signout` | POST sign out |

## Twilio (next)

When you paste `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, we enable phone OTP on the same gate.
