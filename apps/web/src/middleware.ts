import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { needsOnboarding } from "@/lib/onboarding";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  if (!key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const authPaths =
    path.startsWith("/auth/") ||
    path === "/onboarding" ||
    path.startsWith("/api/") ||
    path.startsWith("/design/");

  if (data.user && needsOnboarding(data.user) && !authPaths) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/onboarding";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|design/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
