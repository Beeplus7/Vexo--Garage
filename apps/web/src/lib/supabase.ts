import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://vdtyzqzdakfckpcjxxpi.supabase.co";

const anonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function requireKey(key: string, name: string) {
  if (!key) {
    throw new Error(`${name} is not set`);
  }
  return key;
}

export const supabase: SupabaseClient = createClient(
  url,
  anonKey || "missing-anon-key",
);

export const supabaseAdmin: SupabaseClient = createClient(
  url,
  serviceKey || anonKey || "missing-service-key",
  {
    auth: { persistSession: false, autoRefreshToken: false },
  },
);

export function getSupabaseAnon() {
  return createClient(url, requireKey(anonKey, "SUPABASE_ANON_KEY"));
}

export function getSupabaseAdmin() {
  return createClient(
    url,
    requireKey(serviceKey || anonKey, "SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

// Named helpers kept for earlier scaffolding imports
export { createClient as createBrowserSupabase } from "./supabase/browser";
export { createClient as createServerSupabase } from "./supabase/server";
export { createAdminClient } from "./supabase/admin";
