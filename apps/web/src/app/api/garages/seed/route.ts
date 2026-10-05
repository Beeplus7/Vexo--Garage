import { NextResponse } from "next/server";
import { ensureDemoGarages } from "@/lib/ensure-garage";
import { isAdminAllowed, isProductionRuntime } from "@/lib/production-guard";
import { createClient } from "@/lib/supabase/server";

/** POST /api/garages/seed — upsert demo OL8 garages (admin header or allowlist). */
export async function POST(request: Request) {
  let email: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    email = data.user?.email ?? null;
  } catch {
    email = null;
  }

  const allowed = isAdminAllowed({
    email,
    headerSecret: request.headers.get("x-vexo-admin"),
  });

  if (!allowed && isProductionRuntime()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const garages = await ensureDemoGarages();
    return NextResponse.json({
      ok: true,
      seeded: garages.length,
      ids: garages.map((g) => g?.id),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "seed_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
