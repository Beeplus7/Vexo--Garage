import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getAuthOrigin } from "@/lib/auth-origin";
import { postAuthPath } from "@/lib/garage-auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Email confirmation / magic-link landing.
 * Supabase sends users here with token_hash + type (signup, email, recovery…).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getAuthOrigin(request);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") || "/onboarding";
  const safeNext = next.startsWith("/") ? next : "/onboarding";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      const { data } = await supabase.auth.getUser();
      const dest =
        data.user &&
        (safeNext === "/onboarding" ||
          safeNext === "/" ||
          safeNext === "/garages")
          ? postAuthPath(data.user)
          : safeNext;
      return NextResponse.redirect(`${origin}${dest}`);
    }
    const msg = error.message || "";
    const friendly = /PKCE|code verifier/i.test(msg)
      ? "email_confirmed_login"
      : msg;
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(friendly)}`,
    );
  }

  // Fallback: some templates use ?code= PKCE style
  const code = searchParams.get("code");
  if (code) {
    return NextResponse.redirect(
      `${origin}/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(safeNext)}`,
    );
  }

  return NextResponse.redirect(`${origin}/auth/login?error=invalid_confirm_link`);
}
