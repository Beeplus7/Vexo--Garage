import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const flags = {
    hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasAnon: Boolean(
      process.env.SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
    hasStripe: Boolean(process.env.STRIPE_SECRET_KEY),
    stripeAccountId: process.env.STRIPE_ACCOUNT_ID || null,
    hasStripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    hasStripePublishable: Boolean(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    ),
    hasGoogleClient: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
    ),
    hasTwilio: Boolean(
      process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN,
    ),
    hasTwilioVerify: Boolean(process.env.TWILIO_VERIFY_SERVICE_SID),
    hasTwilioFrom: Boolean(process.env.TWILIO_PHONE_NUMBER),
    hasRedisUrl: Boolean(process.env.REDIS_URL),
    twilioReadyPublic: process.env.NEXT_PUBLIC_TWILIO_READY === "1",
  };

  let database: "connected" | "unreachable" = "unreachable";
  let counts: Record<string, number> | null = null;
  let dbError: string | null = null;

  try {
    const [postcodes, garages, bookings, vehicles, motHistory] =
      await Promise.all([
        prisma.postcode.count(),
        prisma.garage.count(),
        prisma.booking.count(),
        prisma.vehicle.count(),
        prisma.motHistory.count(),
      ]);
    database = "connected";
    counts = { postcodes, garages, bookings, vehicles, motHistory };
  } catch (error) {
    dbError = error instanceof Error ? error.message : "DB error";
  }

  return NextResponse.json({
    ok: database === "connected",
    backend: "vexo_backend_production_user_view",
    supabase: {
      url:
        process.env.SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        null,
      database,
      counts,
      dbError,
      ...flags,
    },
  });
}
