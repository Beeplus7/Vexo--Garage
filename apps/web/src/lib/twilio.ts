/**
 * Twilio SMS via REST (no SDK dep).
 * No-ops cleanly when TWILIO_* keys are absent — production-ready until credentials land.
 */

export type SmsResult =
  | { ok: true; sid: string; queued: false }
  | { ok: true; sid: null; queued: true; reason: "missing_credentials" | "missing_to" }
  | { ok: false; error: string };

function twilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER,
  );
}

export async function sendSms(to: string | null | undefined, body: string): Promise<SmsResult> {
  if (!to) {
    return { ok: true, sid: null, queued: true, reason: "missing_to" };
  }
  if (!twilioConfigured()) {
    console.info("[twilio] skipped (awaiting credentials)", { to, preview: body.slice(0, 80) });
    return { ok: true, sid: null, queued: true, reason: "missing_credentials" };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_PHONE_NUMBER!;
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: from, Body: body }),
      },
    );
    const data = (await res.json()) as { sid?: string; message?: string; error_message?: string };
    if (!res.ok) {
      return { ok: false, error: data.message || data.error_message || `HTTP ${res.status}` };
    }
    return { ok: true, sid: data.sid || "sent", queued: false };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "twilio_send_failed";
    return { ok: false, error: message };
  }
}

export function isTwilioReady() {
  return twilioConfigured();
}
