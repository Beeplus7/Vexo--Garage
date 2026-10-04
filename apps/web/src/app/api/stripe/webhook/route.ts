import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !sig) {
    return NextResponse.json(
      { received: true, mock: "Add STRIPE_WEBHOOK_SECRET + stripe-signature for live verify" },
      { status: 200 },
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "invalid_signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as {
        id: string;
        mode?: string | null;
        payment_intent?: string | { id: string } | null;
        metadata?: Record<string, string> | null;
      };
      const bookingId = session.metadata?.bookingId;
      const piId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id || null;

      if (bookingId) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "held",
            ...(piId ? { stripePaymentIntentId: piId } : {}),
          },
        });
        await prisma.commission.updateMany({
          where: { bookingId },
          data: { status: "held" },
        });
      }

      // Boost / Care subscription — mark garage boostActive
      if (session.mode === "subscription" && session.metadata?.kind === "boost") {
        const garageId = session.metadata.garageId;
        if (garageId) {
          await prisma.garage.updateMany({
            where: { id: garageId },
            data: { boostActive: true },
          });
        }
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as {
        metadata?: Record<string, string> | null;
      };
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        await prisma.booking.updateMany({
          where: { id: bookingId, status: "checkout_pending" },
          data: { status: "checkout_expired" },
        });
        await prisma.commission.updateMany({
          where: { bookingId },
          data: { status: "expired" },
        });
      }
      break;
    }
    case "payment_intent.succeeded": {
      const pi = event.data.object as { id: string };
      await prisma.booking.updateMany({
        where: { stripePaymentIntentId: pi.id },
        data: { status: "paid" },
      });
      break;
    }
    case "payment_intent.amount_capturable_updated": {
      // Manual-capture auth ready
      const pi = event.data.object as { id: string };
      await prisma.booking.updateMany({
        where: { stripePaymentIntentId: pi.id },
        data: { status: "held" },
      });
      break;
    }
    case "payment_intent.payment_failed": {
      const piFailed = event.data.object as { id: string };
      await prisma.booking.updateMany({
        where: { stripePaymentIntentId: piFailed.id },
        data: { status: "payment_failed" },
      });
      break;
    }
    case "payment_intent.canceled": {
      const piCancel = event.data.object as { id: string };
      const canceled = await prisma.booking.findMany({
        where: { stripePaymentIntentId: piCancel.id },
        select: { id: true },
      });
      await prisma.booking.updateMany({
        where: { stripePaymentIntentId: piCancel.id },
        data: { status: "refunded" },
      });
      if (canceled.length) {
        await prisma.commission.updateMany({
          where: { bookingId: { in: canceled.map((b) => b.id) } },
          data: { status: "refunded" },
        });
      }
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as { payment_intent?: string | null };
      const piId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
      if (piId) {
        await prisma.booking.updateMany({
          where: { stripePaymentIntentId: piId },
          data: { status: "refunded" },
        });
      }
      break;
    }
    case "account.updated": {
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true, type: event.type });
}
