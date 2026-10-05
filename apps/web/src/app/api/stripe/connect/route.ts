import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const site =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://app.vexogarage.co.uk";

/**
 * POST /api/stripe/connect
 * Create (or resume) Stripe Connect Express onboarding for a garage.
 * Body: { garageId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { garageId } = await req.json();
    if (!garageId) {
      return NextResponse.json({ error: "garageId required" }, { status: 400 });
    }

    const garage = await prisma.garage.findUnique({ where: { id: garageId } });
    if (!garage) {
      return NextResponse.json({ error: "Garage not found" }, { status: 404 });
    }

    let accountId = garage.stripeConnectId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "GB",
        email: garage.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "company",
        metadata: {
          vexoGarageId: garage.id,
          district: garage.district || "",
          platform: "vexo-garage",
        },
      });
      accountId = account.id;
      await prisma.garage.update({
        where: { id: garageId },
        data: { stripeConnectId: accountId },
      });
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${site}/garage/dashboard?connect=refresh`,
      return_url: `${site}/garage/dashboard?connect=done`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      accountId,
      url: link.url,
      expiresAt: link.expires_at,
      message: "Open url to complete Stripe Connect KYC — garage payouts after Shield approve",
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "connect_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** GET /api/stripe/connect?garageId= — status of Connect account */
export async function GET(req: NextRequest) {
  try {
    const garageId = req.nextUrl.searchParams.get("garageId");
    if (!garageId) {
      return NextResponse.json({ error: "garageId required" }, { status: 400 });
    }
    const garage = await prisma.garage.findUnique({ where: { id: garageId } });
    if (!garage?.stripeConnectId) {
      return NextResponse.json({
        garageId,
        connected: false,
        message: "No Connect account yet — POST /api/stripe/connect",
      });
    }
    const account = await stripe.accounts.retrieve(garage.stripeConnectId);
    return NextResponse.json({
      garageId,
      connected: true,
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "connect_status_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
