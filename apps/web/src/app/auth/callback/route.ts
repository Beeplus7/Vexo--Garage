import { NextResponse } from "next/server";
import { getAuthOrigin } from "@/lib/auth-origin";
import { postAuthPath } from "@/lib/garage-auth";
import { createClient } from "@/lib/supabase/server";

/** Supabase OAuth / email PKCE callback — returns here with ?code= */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getAuthOrigin(request);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/onboarding";
  const safeNext = next.startsWith("/") ? next : "/onboarding";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data } = await supabase.auth.getUser();
      const dest = data.user
        ? safeNext === "/onboarding" || safeNext === "/" || safeNext === "/garages"
          ? postAuthPath(data.user)
          : safeNext
        : "/auth/login";
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

  return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
}
