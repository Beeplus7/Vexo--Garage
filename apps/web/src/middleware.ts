import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isAppHost,
  isAppOnlyPath,
  isMarketingHost,
} from "@/lib/design-catalog";
import { needsGarageSignup, postAuthPath } from "@/lib/garage-auth";
import { needsOnboarding } from "@/lib/onboarding";
import {
  isAdminAllowed,
  isAdminPath,
  isHiddenUserSurface,
  isProductionRuntime,
} from "@/lib/production-guard";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.vexogarage.co.uk";

export async function middleware(request: NextRequest) {
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";
  const path = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  // Marketing host → bounce product routes to app host
  if (isMarketingHost(host) && isAppOnlyPath(path)) {
    return NextResponse.redirect(`${APP_URL}${path}${search}`);
  }

  // Production: hide internal tools from public users
  if (isProductionRuntime() && isHiddenUserSurface(path)) {
    return new NextResponse(null, { status: 404 });
  }

  let response = NextResponse.next({ request });

  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  if (!key) {
    if (isProductionRuntime() && isAdminPath(path)) {
      return new NextResponse(null, { status: 404 });
    }
    return response;
  }

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

  if (
    isProductionRuntime() &&
    isAdminPath(path) &&
    !isAdminAllowed({
      email: data.user?.email,
      headerSecret: request.headers.get("x-vexo-admin"),
    })
  ) {
    return new NextResponse(null, { status: 404 });
  }

  const authPaths =
    path.startsWith("/auth/") ||
    path === "/onboarding" ||
    path.startsWith("/garage/") ||
    path === "/garage/manage" ||
    path.startsWith("/api/");

  if (isAppHost(host) && data.user && !authPaths) {
    if (needsOnboarding(data.user)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/onboarding";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
    if (needsGarageSignup(data.user)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/garage/signup";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
    // App root for garage owners → dashboard (not customer finder)
    if (path === "/" && data.user.user_metadata?.role === "garage") {
      const dest = postAuthPath(data.user);
      if (dest !== path) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = dest;
        redirectUrl.search = "";
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|design/pages/|design/vexo-enhance\\.|.*\\.(?:svg|png|jpg|jpeg|gif|webp|html|css|js|map|ico)$).*)",
  ],
};
