/**
 * Full 38-page design → route map.
 * Latest designs win where superseded drafts exist (3→29, 4→33, etc.).
 */
export type DesignHost = "marketing" | "app" | "both";

export type DesignRoute = {
  n: number;
  route: string;
  title: string;
  design: number;
  host: DesignHost;
  dynamic?: boolean;
};

/** Canonical live routes (hero → 38). */
export const DESIGN_ROUTES: DesignRoute[] = [
  { n: 1, route: "/", title: "Hero marketing", design: 1, host: "marketing" },
  { n: 2, route: "/garages", title: "App home / garages finder", design: 2, host: "app" },
  // Design 38 is the internal "38 of 38 FINAL" checklist/sitemap — not a user home
  { n: 38, route: "/dev/final-map", title: "Final site map (internal)", design: 38, host: "app" },
  { n: 15, route: "/garages/[postcode]", title: "Garages by postcode", design: 15, host: "app", dynamic: true },
  { n: 16, route: "/garage/[slug]", title: "Garage detail", design: 16, host: "app", dynamic: true },
  { n: 11, route: "/garage", title: "For garages", design: 11, host: "both" },
  { n: 32, route: "/garage/signup", title: "Garage signup", design: 32, host: "app" },
  { n: 33, route: "/garage/dashboard", title: "Garage dashboard", design: 33, host: "app" },
  { n: 29, route: "/booking/[id]", title: "Booking detail", design: 29, host: "app", dynamic: true },
  { n: 28, route: "/booking/success", title: "Booking success", design: 28, host: "app" },
  { n: 30, route: "/passport/[reg]", title: "Passport", design: 30, host: "app", dynamic: true },
  { n: 5, route: "/passport-info", title: "Passport info", design: 5, host: "both" },
  { n: 31, route: "/widget/[garageSlug]", title: "Embed widget", design: 31, host: "app", dynamic: true },
  { n: 8, route: "/how-it-works", title: "How it works", design: 8, host: "marketing" },
  { n: 9, route: "/trust", title: "Trust & safety", design: 9, host: "marketing" },
  { n: 10, route: "/pricing", title: "Pricing", design: 10, host: "both" },
  { n: 25, route: "/contact", title: "Contact", design: 25, host: "marketing" },
  { n: 26, route: "/reviews", title: "Reviews", design: 26, host: "marketing" },
  { n: 27, route: "/services", title: "Services", design: 27, host: "marketing" },
  { n: 23, route: "/terms", title: "Terms", design: 23, host: "both" },
  { n: 24, route: "/privacy", title: "Privacy", design: 24, host: "both" },
  { n: 35, route: "/legal", title: "Terms & privacy", design: 35, host: "both" },
  { n: 18, route: "/boost", title: "Boost", design: 11, host: "both" }, // marketing surface; design from for-garages family
  { n: 34, route: "/admin", title: "Admin", design: 34, host: "app" },
  { n: 21, route: "/admin/dashboard", title: "Admin dashboard", design: 21, host: "app" },
  { n: 34, route: "/admin/garages", title: "Admin garages", design: 34, host: "app" },
  { n: 21, route: "/admin/keywords", title: "Admin keywords", design: 21, host: "app" },
  { n: 34, route: "/admin/bookings", title: "Admin bookings", design: 34, host: "app" },
  { n: 36, route: "/sitemap-preview", title: "Sitemap preview", design: 36, host: "both" },
  { n: 37, route: "/dev/api-routes", title: "API routes map", design: 37, host: "app" },
];

/** Superseded drafts still viewable at /design/[n] */
export const SUPERSEDED_DESIGNS = [3, 4, 6, 7, 12, 13, 14, 17, 19, 20, 22] as const;

export function designSrc(n: number): string {
  return `/design/pages/${String(n).padStart(2, "0")}.html`;
}

export function isMarketingHost(host: string): boolean {
  const h = host.split(":")[0].toLowerCase();
  return h === "vexogarage.co.uk" || h === "www.vexogarage.co.uk";
}

export function isAppHost(host: string): boolean {
  const h = host.split(":")[0].toLowerCase();
  return h === "app.vexogarage.co.uk" || h === "localhost" || h === "127.0.0.1";
}

/** Paths that must live on the app host (redirect from marketing). */
export const APP_ONLY_PREFIXES = [
  "/auth",
  "/onboarding",
  "/garages",
  "/booking",
  "/admin",
  "/garage/dashboard",
  "/garage/signup",
  "/passport/",
  "/widget",
  "/dev/",
];

export function isAppOnlyPath(pathname: string): boolean {
  return APP_ONLY_PREFIXES.some((p) => {
    if (p.endsWith("/")) return pathname.startsWith(p) || pathname === p.slice(0, -1);
    return pathname === p || pathname.startsWith(`${p}/`);
  });
}
