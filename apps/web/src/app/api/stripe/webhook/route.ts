import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    // Mock for dev if webhook secret missing
    return NextResponse.json({ received: true, mock: 'Add STRIPE_WEBHOOK_SECRET for live' });
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const pi = event.data.object as any;
      await prisma.booking.updateMany({
        where: { stripePaymentIntentId: pi.id },
        data: { status: 'paid' },
      });
      break;
    case 'payment_intent.payment_failed':
      const piFailed = event.data.object as any;
      await prisma.booking.updateMany({
        where: { stripePaymentIntentId: piFailed.id },
        data: { status: 'payment_failed' },
      });
      break;
  }

  return NextResponse.json({ received: true });
}