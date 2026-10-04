import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      postcodes,
      garages,
      bookings,
      vehicles,
      motHistory,
    ] = await Promise.all([
      prisma.postcode.count(),
      prisma.garage.count(),
      prisma.booking.count(),
      prisma.vehicle.count(),
      prisma.motHistory.count(),
    ]);

    return NextResponse.json({
      ok: true,
      backend: "vexo_backend_production_supabase_ready",
      supabase: {
        url:
          process.env.SUPABASE_URL ||
          process.env.NEXT_PUBLIC_SUPABASE_URL ||
          null,
        database: "connected",
        counts: { postcodes, garages, bookings, vehicles, motHistory },
        hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        hasAnon: Boolean(
          process.env.SUPABASE_ANON_KEY ||
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        ),
        hasStripe: Boolean(process.env.STRIPE_SECRET_KEY),
        stripeAccountId: process.env.STRIPE_ACCOUNT_ID || null,
        hasStripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
        hasStripePublishable: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
        hasRedisUrl: Boolean(process.env.REDIS_URL),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "DB error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
