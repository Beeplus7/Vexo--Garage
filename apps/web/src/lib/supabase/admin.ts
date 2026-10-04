import { createClient } from "@supabase/supabase-js";
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  hasServiceRoleKey,
} from "./env";

/** Service-role client. Prefer `query()` from `@/lib/db` until this key is set. */
export function createAdminClient() {
  if (!hasServiceRoleKey()) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set — use DATABASE_URL / lib/db instead",
    );
  }

  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
