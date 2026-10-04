import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * GET /api/stripe/session?session_id=cs_...
 * Resolve Checkout Session + linked booking (if any).
 */
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "session_id required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "subscription"],
    });

    const bookingId = session.metadata?.bookingId;
    let booking = null;
    if (bookingId) {
      booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { garage: true, customer: true },
      });
    }

    const pi = session.payment_intent;
    const paymentIntentId =
      typeof pi === "string" ? pi : pi && typeof pi === "object" ? pi.id : null;

    return NextResponse.json({
      session: {
        id: session.id,
        mode: session.mode,
        status: session.status,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_details?.email || session.customer_email,
        url: session.url,
        paymentIntentId,
        subscriptionId:
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id || null,
        metadata: session.metadata,
      },
      booking,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "session_lookup_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
