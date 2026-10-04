import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { APP_URL, stripe } from "@/lib/stripe";
import { STRIPE_CATALOG, commissionForService, priceForService, priceIdForService } from "@/lib/stripe-pricing";
import { ensureGarage } from "@/lib/ensure-garage";
import { sendSms } from "@/lib/twilio";

type CheckoutKind = "booking" | "boost" | "care";

/**
 * POST /api/stripe/checkout
 * Create a Stripe Checkout Session.
 *
 * Booking (escrow hold):
 *   { kind:"booking", reg, postcode, service?, garageId, customerEmail?, customerPhone? }
 *
 * Subscriptions:
 *   { kind:"boost"|"care", garageId?, customerEmail? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const kind = (body.kind || "booking") as CheckoutKind;

    if (kind === "boost" || kind === "care") {
      return createSubscriptionSession(kind, body);
    }
    return createBookingSession(body);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "checkout_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function createBookingSession(body: {
  reg?: string;
  postcode?: string;
  service?: string;
  garageId?: string;
  customerEmail?: string;
  customerPhone?: string;
}) {
  const { reg, postcode, service = "MOT", garageId, customerEmail, customerPhone } = body;
  if (!reg || !postcode || !garageId) {
    return NextResponse.json(
      { error: "reg, postcode, garageId required" },
      { status: 400 },
    );
  }

  const garage = await ensureGarage(garageId);
  if (!garage) {
    return NextResponse.json({ error: "Garage not found — seed garages table" }, { status: 404 });
  }

  const cleanReg = reg.toUpperCase().replace(/\s/g, "");
  const district = postcode.split(" ")[0] || garage.district || "OL8";
  const price = priceForService(service);
  const commission = commissionForService(service, price);
  const garageAmount = price - commission;
  const catalogPriceId = priceIdForService(service) || STRIPE_CATALOG.mot.priceId;

  let customer;
  if (customerPhone) {
    customer = await prisma.customer.upsert({
      where: { phone: customerPhone },
      update: { reg: cleanReg, postcode, district, email: customerEmail || undefined },
      create: {
        phone: customerPhone,
        email: customerEmail || undefined,
        reg: cleanReg,
        postcode,
        district,
      },
    });
  } else if (customerEmail) {
    customer = await prisma.customer.upsert({
      where: { email: customerEmail },
      update: { reg: cleanReg, postcode, district },
      create: {
        email: customerEmail,
        reg: cleanReg,
        postcode,
        district,
      },
    });
  }

  const booking = await prisma.booking.create({
    data: {
      reg: cleanReg,
      postcode,
      district,
      service,
      price,
      status: "checkout_pending",
      garageId: garage.id,
      customerId: customer?.id,
      commission,
    },
  });

  await prisma.commission.create({
    data: {
      bookingId: booking.id,
      garageAmount,
      vexoAmount: commission,
      status: "pending_checkout",
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: customerEmail || undefined,
    line_items: [{ price: catalogPriceId, quantity: 1 }],
    success_url: `${APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/garages/${encodeURIComponent(district)}?cancelled=1&booking=${booking.id}`,
    payment_intent_data: {
      capture_method: "manual",
      description: `Vexo Garage — ${service} — ${cleanReg} — ${garage.name}`,
      metadata: {
        bookingId: booking.id,
        reg: cleanReg,
        district,
        garageId: garage.id,
        service,
        garageAmount: String(garageAmount),
        vexoAmount: String(commission),
        platform: "vexo-garage",
        kind: "booking",
      },
    },
    metadata: {
      bookingId: booking.id,
      reg: cleanReg,
      district,
      garageId: garage.id,
      service,
      platform: "vexo-garage",
      kind: "booking",
    },
  });

  // Soft-notify garage (queued until Twilio keys)
  await sendSms(
    garage.phone,
    `CHECKOUT started ${cleanReg} ${service} ${postcode} — Accept after pay: ${APP_URL}/garage/dashboard`,
  );

  return NextResponse.json({
    kind: "booking",
    bookingId: booking.id,
    sessionId: session.id,
    url: session.url,
    amount: price,
    currency: "gbp",
    captureMethod: "manual",
    breakdown: {
      customerPays: `£${(price / 100).toFixed(2)}`,
      garageGets: `£${(garageAmount / 100).toFixed(2)}`,
      vexoGets: `£${(commission / 100).toFixed(2)}`,
      hold: "Checkout → PaymentIntent held (manual capture) until Shield approve",
    },
    next: "Redirect customer to url → webhook checkout.session.completed → garage accepts → proof → approve",
  });
}

async function createSubscriptionSession(
  kind: "boost" | "care",
  body: { garageId?: string; customerEmail?: string },
) {
  const catalog = STRIPE_CATALOG[kind];
  const garage = body.garageId ? await ensureGarage(body.garageId) : null;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: body.customerEmail || undefined,
    line_items: [{ price: catalog.priceId, quantity: 1 }],
    success_url: `${APP_URL}/boost?session_id={CHECKOUT_SESSION_ID}&status=success`,
    cancel_url: `${APP_URL}/pricing?cancelled=1`,
    metadata: {
      kind,
      garageId: garage?.id || "",
      platform: "vexo-garage",
    },
    subscription_data: {
      metadata: {
        kind,
        garageId: garage?.id || "",
        platform: "vexo-garage",
      },
    },
  });

  return NextResponse.json({
    kind,
    sessionId: session.id,
    url: session.url,
    amount: catalog.unitAmount,
    currency: "gbp",
    garageId: garage?.id || null,
    next: "Redirect to url — subscription activates on checkout.session.completed",
  });
}
