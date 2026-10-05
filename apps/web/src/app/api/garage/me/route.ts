import { NextResponse } from "next/server";
import { getGarageMeta, isGarageRole } from "@/lib/garage-auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isGarageRole(data.user)) {
    return NextResponse.json({ error: "Not a garage account" }, { status: 403 });
  }

  const meta = getGarageMeta(data.user);
  let garage = meta.garage_id
    ? await prisma.garage.findUnique({ where: { id: meta.garage_id } })
    : null;
  if (!garage && data.user.email) {
    garage = await prisma.garage.findFirst({
      where: { email: data.user.email.toLowerCase() },
    });
  }

  if (!garage) {
    return NextResponse.json({ ok: false, garage: null, needsSignup: true });
  }

  const bookings = await prisma.booking.findMany({
    where: { garageId: garage.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      reg: true,
      postcode: true,
      service: true,
      price: true,
      status: true,
      videoProofUrl: true,
      motCertUrl: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    ok: true,
    garage: {
      id: garage.id,
      name: garage.name,
      postcode: garage.postcode,
      district: garage.district,
      phone: garage.phone,
      email: garage.email,
      services: garage.services,
      rating: garage.rating,
      bookingsCount: garage.bookingsCount,
      trafficViews: garage.trafficViews,
      boostActive: garage.boostActive,
      stripeConnectId: garage.stripeConnectId,
      motLicenseVerified: garage.motLicenseVerified,
      companiesHouseVerified: garage.companiesHouseVerified,
    },
    bookings,
    account: {
      email: data.user.email,
      fullName: data.user.user_metadata?.full_name || null,
    },
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user || !isGarageRole(data.user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const meta = getGarageMeta(data.user);
  if (!meta.garage_id) {
    return NextResponse.json({ error: "Complete garage signup first" }, { status: 400 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    phone?: string;
    postcode?: string;
    services?: Record<string, number>;
  };

  const dataUpdate: {
    name?: string;
    phone?: string | null;
    postcode?: string;
    district?: string;
    services?: Record<string, number>;
  } = {};

  if (body.name?.trim()) dataUpdate.name = body.name.trim();
  if (body.phone !== undefined) dataUpdate.phone = body.phone?.trim() || null;
  if (body.postcode?.trim()) {
    const postcode = body.postcode.trim().toUpperCase();
    dataUpdate.postcode = postcode;
    dataUpdate.district = postcode.split(/\s+/)[0] || postcode.slice(0, 3);
  }
  if (body.services && typeof body.services === "object") {
    const services: Record<string, number> = {};
    for (const [key, value] of Object.entries(body.services)) {
      const name = key.trim();
      const price = Number(value);
      if (!name || !Number.isFinite(price) || price < 0) continue;
      services[name] = Math.round(price * 100) / 100;
    }
    if (Object.keys(services).length) dataUpdate.services = services;
  }

  const garage = await prisma.garage.update({
    where: { id: meta.garage_id },
    data: dataUpdate,
  });

  if (dataUpdate.name) {
    await supabase.auth.updateUser({
      data: { garage_name: dataUpdate.name },
    });
  }

  return NextResponse.json({
    ok: true,
    garage: {
      id: garage.id,
      name: garage.name,
      postcode: garage.postcode,
      district: garage.district,
      services: garage.services,
      phone: garage.phone,
      email: garage.email,
      stripeConnectId: garage.stripeConnectId,
      boostActive: garage.boostActive,
    },
  });
}
