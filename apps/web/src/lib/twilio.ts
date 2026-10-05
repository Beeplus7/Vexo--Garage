/**
 * Twilio SMS + Verify via REST (no SDK dep).
 * Transactional SMS needs TWILIO_PHONE_NUMBER.
 * Phone OTP uses TWILIO_VERIFY_SERVICE_SID (works on trial for verified numbers).
 */

export type SmsResult =
  | { ok: true; sid: string; queued: false }
  | { ok: true; sid: null; queued: true; reason: "missing_credentials" | "missing_to" }
  | { ok: false; error: string };

export type VerifyResult =
  | { ok: true; status: string }
  | { ok: false; error: string };

function authHeader() {
  const sid = process.env.TWILIO_ACCOUNT_SID || "";
  const token = process.env.TWILIO_AUTH_TOKEN || "";
  return `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`;
}

function hasAccount() {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
}

function twilioSmsConfigured() {
  return Boolean(hasAccount() && process.env.TWILIO_PHONE_NUMBER);
}

function verifyServiceSid() {
  return process.env.TWILIO_VERIFY_SERVICE_SID || "";
}

export function isTwilioReady() {
  return hasAccount() && Boolean(verifyServiceSid() || process.env.TWILIO_PHONE_NUMBER);
}

export function isTwilioVerifyReady() {
  return hasAccount() && Boolean(verifyServiceSid());
}

export async function sendSms(to: string | null | undefined, body: string): Promise<SmsResult> {
  if (!to) {
    return { ok: true, sid: null, queued: true, reason: "missing_to" };
  }
  if (!twilioSmsConfigured()) {
    console.info("[twilio] sms skipped (need From number)", { to, preview: body.slice(0, 80) });
    return { ok: true, sid: null, queued: true, reason: "missing_credentials" };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const from = process.env.TWILIO_PHONE_NUMBER!;

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader(),
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

/** Start phone OTP via Twilio Verify. */
export async function sendPhoneCode(to: string): Promise<VerifyResult> {
  const service = verifyServiceSid();
  if (!hasAccount() || !service) {
    return { ok: false, error: "Twilio Verify not configured" };
  }
  try {
    const res = await fetch(
      `https://verify.twilio.com/v2/Services/${service}/Verifications`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader(),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, Channel: "sms" }),
      },
    );
    const data = (await res.json()) as { status?: string; message?: string };
    if (!res.ok) {
      return { ok: false, error: data.message || `HTTP ${res.status}` };
    }
    return { ok: true, status: data.status || "pending" };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "verify_send_failed" };
  }
}

/** Check phone OTP via Twilio Verify. */
export async function checkPhoneCode(to: string, code: string): Promise<VerifyResult> {
  const service = verifyServiceSid();
  if (!hasAccount() || !service) {
    return { ok: false, error: "Twilio Verify not configured" };
  }
  try {
    const res = await fetch(
      `https://verify.twilio.com/v2/Services/${service}/VerificationCheck`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader(),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, Code: code }),
      },
    );
    const data = (await res.json()) as { status?: string; message?: string; valid?: boolean };
    if (!res.ok) {
      return { ok: false, error: data.message || `HTTP ${res.status}` };
    }
    if (data.status === "approved" || data.valid === true) {
      return { ok: true, status: "approved" };
    }
    return { ok: false, error: "Invalid or expired code" };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "verify_check_failed" };
  }
}
