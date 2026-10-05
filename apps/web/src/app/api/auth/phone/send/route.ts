import { NextResponse } from "next/server";
import { toE164 } from "@/lib/phone";
import { isTwilioVerifyReady, sendPhoneCode } from "@/lib/twilio";

export async function POST(request: Request) {
  if (!isTwilioVerifyReady()) {
    return NextResponse.json({ error: "Twilio Verify not ready" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { phone?: string };
  const phone = toE164(body.phone || "");
  if (!phone) {
    return NextResponse.json(
      { error: "Enter a valid phone (e.g. 07… or +44…)" },
      { status: 400 },
    );
  }

  const result = await sendPhoneCode(phone);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, phone, status: result.status });
}
