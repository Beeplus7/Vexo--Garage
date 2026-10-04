import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/garages/[id]/accept - Garage Accepts - National Dashboard
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: garageId } = await params;
  const { bookingId } = await req.json();

  if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 });

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'accepted' },
  });

  // Increment garage bookingsCount
  await prisma.garage.update({
    where: { id: garageId },
    data: { bookingsCount: { increment: 1 } },
  });

  // TODO: Twilio SMS to customer - Vexo Garage: Your MOT booked at A1 Motors Oldham - 15 Oct 10am - Garage does job - Must upload video proof next step
  // await twilioClient.messages.create({
  //   body: `Vexo Garage: Your ${booking.service} booked at garage - ${booking.reg} - ${booking.postcode} - Garage will upload video proof after job - Your car. Your service. Your choice. - vexogarage.co.uk/booking/${booking.id}`,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: booking.customerPhone,
  // });

  return NextResponse.json({
    booking,
    message: `Booking accepted - Garage does job - Must upload video proof next step - No calling close garage and paying - You don't pay garage, garage pays you after job via Stripe automated split`,
    next: 'POST /api/proof/upload - MinIO S3 video 30sec + MOT cert mandatory +£2 Shield fee - BookMyGarage does not have video proof',
  });
}