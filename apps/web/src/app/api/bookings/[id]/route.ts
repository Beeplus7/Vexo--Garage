import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/bookings/[id] — booking detail for customer approve / garage proof */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      garage: {
        select: {
          id: true,
          name: true,
          postcode: true,
          district: true,
          phone: true,
          rating: true,
        },
      },
      customer: { select: { email: true, phone: true } },
    },
  });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const proof = await prisma.videoProof.findUnique({ where: { bookingId: id } });

  return NextResponse.json({
    ok: true,
    booking: {
      id: booking.id,
      reg: booking.reg,
      postcode: booking.postcode,
      district: booking.district,
      service: booking.service,
      price: booking.price,
      status: booking.status,
      videoProofUrl: booking.videoProofUrl,
      motCertUrl: booking.motCertUrl,
      passportHash: booking.passportHash,
      createdAt: booking.createdAt,
      garage: booking.garage,
      customer: booking.customer,
      proof: proof
        ? {
            videoUrl: proof.videoUrl,
            certUrl: proof.certUrl,
            aiVerified: proof.aiVerified,
          }
        : null,
    },
  });
}
