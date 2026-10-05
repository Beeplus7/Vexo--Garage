import { NextResponse } from "next/server";
import { getAuthOrigin } from "@/lib/auth-origin";
import { needsOnboarding } from "@/lib/onboarding";
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
      const dest =
        data.user && needsOnboarding(data.user)
          ? "/onboarding"
          : safeNext === "/onboarding" || safeNext === "/"
            ? "/garages"
            : safeNext;
      return NextResponse.redirect(`${origin}${dest}`);
    }
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
}
