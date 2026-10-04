# Google Auth — Entrance gate

## Already done in repo / Google Cloud

- OAuth client created (VisaguideOS)
- Origins: `app.vexogarage.co.uk`, `vexogarage.co.uk`, `localhost:3001`
- Redirects: `/auth/callback` + Supabase `/auth/v1/callback`
- Test user: `olabamiji.kolabalogun@gmail.com`
- Keys in `credentials/.env.google` + VPS `.env`

## You must enable Google inside Supabase (one-time)

1. Open [Supabase → Authentication → Providers → Google](https://supabase.com/dashboard/project/vdtyzqzdakfckpcjxxpi/auth/providers)
2. **Enable** Google
3. Paste:
   - **Client ID** = `GOOGLE_CLIENT_ID` from `credentials/.env.google`
   - **Client Secret** = `GOOGLE_CLIENT_SECRET`
4. Save

## Supabase URL config

[Authentication → URL Configuration](https://supabase.com/dashboard/project/vdtyzqzdakfckpcjxxpi/auth/url-configuration)

- **Site URL:** `https://app.vexogarage.co.uk`
- **Redirect URLs** (add all):
  - `https://app.vexogarage.co.uk/auth/callback`
  - `https://vexogarage.co.uk/auth/callback`
  - `http://localhost:3001/auth/callback`

## App routes

| Route | Role |
|-------|------|
| `/auth/login` | Google live · Twilio stub |
| `/auth/register` | Same Google flow (creates user) |
| `/auth/callback` | PKCE code exchange |
| `/auth/signout` | POST sign out |

## Twilio (next)

When you paste `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, we enable phone OTP on the same gate.
