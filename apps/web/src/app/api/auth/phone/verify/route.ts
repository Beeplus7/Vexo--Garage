import { NextResponse } from "next/server";
import { toE164 } from "@/lib/phone";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { checkPhoneCode, isTwilioVerifyReady } from "@/lib/twilio";

export async function POST(request: Request) {
  if (!isTwilioVerifyReady()) {
    return NextResponse.json({ error: "Twilio Verify not ready" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    phone?: string;
    code?: string;
  };
  const phone = toE164(body.phone || "");
  const code = (body.code || "").trim();
  if (!phone || !/^\d{4,8}$/.test(code)) {
    return NextResponse.json({ error: "Phone and 6-digit code required" }, { status: 400 });
  }

  const checked = await checkPhoneCode(phone, code);
  if (!checked.ok) {
    return NextResponse.json({ error: checked.error }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "Server missing SUPABASE_SERVICE_ROLE_KEY for phone session" },
      { status: 500 },
    );
  }

  const email = `phone.${phone.replace(/\D/g, "")}@users.vexogarage.co.uk`;

  const created = await admin.auth.admin.createUser({
    email,
    phone,
    phone_confirm: true,
    email_confirm: true,
    user_metadata: {
      phone,
      phone_verified: true,
      role: "customer",
      onboarding_complete: false,
    },
  });

  let userId = created.data.user?.id ?? null;

  if (!userId) {
    // Already registered — find by synthetic email
    const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existing = listed.data.users.find((u) => u.email === email);
    if (!existing) {
      return NextResponse.json(
        { error: created.error?.message || "Could not create user" },
        { status: 500 },
      );
    }
    userId = existing.id;
    await admin.auth.admin.updateUserById(userId, {
      phone,
      phone_confirm: true,
      user_metadata: {
        ...existing.user_metadata,
        phone,
        phone_verified: true,
      },
    });
  }

  const link = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (link.error || !link.data.properties?.hashed_token) {
    return NextResponse.json(
      { error: link.error?.message || "Could not start session" },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const { error: otpError } = await supabase.auth.verifyOtp({
    token_hash: link.data.properties.hashed_token,
    type: "email",
  });
  if (otpError) {
    return NextResponse.json({ error: otpError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, next: "/onboarding", userId });
}
