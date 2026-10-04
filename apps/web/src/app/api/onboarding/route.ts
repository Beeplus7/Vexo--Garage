import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const email = (body.email || data.user.email || "").toLowerCase();
    const phone = body.phone || null;
    const postcode = body.postcode || null;
    const district = body.district || null;
    const reg = body.reg || null;

    if (!email && !phone) {
      return NextResponse.json({ error: "email or phone required" }, { status: 400 });
    }

    let customer;
    if (email) {
      customer = await prisma.customer.upsert({
        where: { email },
        update: { phone, postcode, district, reg },
        create: { email, phone, postcode, district, reg },
      });
    } else {
      customer = await prisma.customer.upsert({
        where: { phone },
        update: { email, postcode, district, reg },
        create: { email, phone, postcode, district, reg },
      });
    }

    return NextResponse.json({
      ok: true,
      customerId: customer.id,
      role: body.role || "customer",
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "onboarding_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
