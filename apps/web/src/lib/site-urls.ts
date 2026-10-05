export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://app.vexogarage.co.uk";
export const MARKETING_URL =
  process.env.NEXT_PUBLIC_MARKETING_URL || "https://vexogarage.co.uk";

export function absoluteApp(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${APP_URL}${p}`;
}

export function absoluteMarketing(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${MARKETING_URL}${p}`;
}

/** Paths that belong on the marketing sitemap. */
export const MARKETING_SITEMAP_PATHS = [
  "/",
  "/how-it-works",
  "/trust",
  "/pricing",
  "/contact",
  "/reviews",
  "/services",
  "/garage",
  "/boost",
  "/passport-info",
  "/terms",
  "/privacy",
  "/legal",
] as const;

/** Paths that belong on the app sitemap (indexed product surfaces). */
export const APP_SITEMAP_PATHS = [
  "/",
  "/garages",
  "/passport-info",
  "/pricing",
  "/garage",
  "/terms",
  "/privacy",
  "/legal",
] as const;
