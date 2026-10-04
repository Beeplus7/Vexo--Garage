# Onboarding + email confirmation

## Flow

1. **Register** (`/auth/register`) — Google or email/password  
2. **Email signup** → Supabase sends “Confirm your Vexo Garage account”  
3. User clicks link → `/auth/confirm` → session → **`/onboarding`**  
4. Onboarding collects name, postcode, optional phone/reg, role (customer/garage)  
5. Marks `user_metadata.onboarding_complete = true` + upserts `customers` row  

Google users skip the confirm email (Google verifies email) and go straight to onboarding.

## Pages

| Path | Purpose |
|------|---------|
| `/auth/register` | Signup (Google + email) |
| `/auth/check-email` | “Check your inbox” after email signup |
| `/auth/confirm` | Email confirmation link handler |
| `/onboarding` | Profile completion gate |

## Supabase

- `mailer_autoconfirm = false` (confirmation required for email signup)
- Custom confirm subject/template (Vexo branded)
- Built-in Supabase mail (rate limit ~2/hour) until custom SMTP is added
