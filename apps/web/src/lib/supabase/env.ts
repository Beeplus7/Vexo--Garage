export function getSupabaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://vdtyzqzdakfckpcjxxpi.supabase.co"
  );
}

/** Browser key — prefer anon JWT for Auth/OAuth; publishable as fallback. */
export function getSupabasePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ""
  );
}

/** Server-only secret for admin/service operations. */
export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function hasServiceRoleKey() {
  return Boolean(getSupabaseServiceRoleKey());
}
