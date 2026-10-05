/** Production surface guards for middleware. */

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Next routes hidden from public users (static /design/pages/*.html stay public). */
export function isHiddenUserSurface(pathname: string): boolean {
  if (pathname === "/sitemap-preview" || pathname.startsWith("/sitemap-preview/")) {
    return true;
  }
  if (pathname === "/dev" || pathname.startsWith("/dev/")) {
    return true;
  }
  // Index + archive viewer only — keep /design/pages and enhance assets
  if (pathname === "/design") return true;
  if (/^\/design\/\d+$/.test(pathname)) return true;
  return false;
}

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminAllowed(opts: {
  email?: string | null;
  headerSecret?: string | null;
}): boolean {
  const expected = process.env.VEXO_ADMIN_SECRET || "";
  if (expected && opts.headerSecret && opts.headerSecret === expected) {
    return true;
  }
  const email = (opts.email || "").toLowerCase();
  if (email && adminEmails().includes(email)) return true;
  // Local / non-production: open for development
  if (!isProductionRuntime()) return true;
  // Production with no allowlist configured: deny
  return false;
}
