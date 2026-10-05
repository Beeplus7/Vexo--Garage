/**
 * CTA label → path map for Claude design HTML buttons (injected into iframes).
 * App-only paths are prefixed with APP origin at inject time.
 */

export const APP_CTA_PATHS = new Set([
  "/auth/login",
  "/auth/register",
  "/garages",
  "/garage/signup",
  "/garage/dashboard",
  "/booking/success",
  "/onboarding",
  "/admin",
  "/passport-info",
]);

/** Ordered: longer / more specific labels first. */
export const CTA_RULES: { match: RegExp; path: string }[] = [
  { match: /garage\s*login|log\s*in|sign\s*in|login/i, path: "/auth/login" },
  {
    match: /free\s*to\s*join|sign\s*up|create\s*account|register|join\s*free/i,
    path: "/auth/register",
  },
  { match: /join\s*as\s*garage|garage\s*signup|list\s*your\s*garage/i, path: "/garage/signup" },
  { match: /for\s*garages|garage\s*dashboard/i, path: "/garage" },
  { match: /how\s*it\s*works/i, path: "/how-it-works" },
  { match: /trust\s*&\s*safety|trust\s*and\s*safety|vexo\s*shield/i, path: "/trust" },
  { match: /pricing|see\s*pricing|price\s*list/i, path: "/pricing" },
  { match: /contact\s*us|^contact$/i, path: "/contact" },
  { match: /reviews|see\s*reviews/i, path: "/reviews" },
  { match: /services|our\s*services/i, path: "/services" },
  { match: /view\s*passport|digital\s*passport|passport/i, path: "/passport-info" },
  { match: /boost|£199\/mo/i, path: "/boost" },
  {
    match:
      /book\s*mot|book\s*now|^book$|find\s*garage|find\s*a\s*garage|search|get\s*started|start\s*booking|3\s*garages/i,
    path: "/garages",
  },
  { match: /terms/i, path: "/terms" },
  { match: /privacy/i, path: "/privacy" },
  { match: /legal/i, path: "/legal" },
];

export function resolveCtaPath(label: string): string | null {
  const text = label.replace(/\s+/g, " ").trim();
  if (!text || text.length > 80) return null;
  for (const rule of CTA_RULES) {
    if (rule.match.test(text)) return rule.path;
  }
  return null;
}

/** Kept for DesignEmbed fallback if external CSS fails to load. */
export const DESIGN_INJECT_CSS = `
@import url("/design/vexo-enhance.css");
`;
