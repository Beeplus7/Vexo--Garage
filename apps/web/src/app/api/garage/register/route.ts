import { NextResponse } from "next/server";
import { DEFAULT_GARAGE_SERVICES } from "@/lib/garage-auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type Body = {
  name?: string;
  phone?: string;
  postcode?: string;
  motLicense?: string;
  companiesHouse?: string;
  services?: Record<string, number>;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Body;
  const name = (body.name || "").trim();
  const postcode = (body.postcode || data.user.user_metadata?.postcode || "")
    .toString()
    .trim()
    .toUpperCase();
  if (!name) {
    return NextResponse.json({ error: "Company / garage name required" }, { status: 400 });
  }
  if (!postcode) {
    return NextResponse.json({ error: "Postcode required" }, { status: 400 });
  }

  const district = postcode.split(/\s+/)[0] || postcode.slice(0, 3);
  const area = district.replace(/\d/g, "") || "UK";
  let lat = 53.544;
  let lng = -2.116;
  let region = "North West";
  try {
    const pcRes = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`,
    );
    if (pcRes.ok) {
      const pcJson = (await pcRes.json()) as {
        result?: { latitude: number; longitude: number; region?: string };
      };
      if (pcJson.result) {
        lat = pcJson.result.latitude;
        lng = pcJson.result.longitude;
        region = pcJson.result.region || region;
      }
    }
  } catch {
    // keep defaults
  }

  const services = sanitizeServices(body.services);

  let companiesHouseVerified = false;
  const chNumber = (body.companiesHouse || "").replace(/\s/g, "");
  if (chNumber) {
    const key = process.env.COMPANIES_HOUSE_API_KEY;
    if (key) {
      try {
        const auth =
          "Basic " + Buffer.from(`${key}:`, "utf8").toString("base64");
        const chRes = await fetch(
          `https://api.company-information.service.gov.uk/company/${encodeURIComponent(chNumber)}`,
          { headers: { Authorization: auth } },
        );
        companiesHouseVerified = chRes.ok;
        if (!chRes.ok && chRes.status === 404) {
          return NextResponse.json(
            { error: "Companies House number not found" },
            { status: 400 },
          );
        }
      } catch {
        companiesHouseVerified = false;
      }
    }
  }

  const email = (data.user.email || "").toLowerCase();
  const existing = email
    ? await prisma.garage.findFirst({ where: { email } })
    : null;

  const garage = existing
    ? await prisma.garage.update({
        where: { id: existing.id },
        data: {
          name,
          postcode,
          district,
          area,
          region,
          lat,
          lng,
          phone: body.phone?.trim() || data.user.user_metadata?.phone || null,
          email: email || null,
          services,
          motLicenseVerified: Boolean(body.motLicense?.trim()),
          companiesHouseVerified,
        },
      })
    : await prisma.garage.create({
        data: {
          name,
          postcode,
          district,
          area,
          region,
          lat,
          lng,
          phone: body.phone?.trim() || data.user.user_metadata?.phone || null,
          email: email || null,
          services,
          motLicenseVerified: Boolean(body.motLicense?.trim()),
          companiesHouseVerified,
          insuranceVerified: true,
        },
      });

  const { error: metaError } = await supabase.auth.updateUser({
    data: {
      role: "garage",
      garage_id: garage.id,
      garage_name: garage.name,
      garage_signup_complete: true,
      mot_license: body.motLicense?.trim() || null,
      onboarding_complete: true,
      postcode,
      district,
      phone: body.phone?.trim() || data.user.user_metadata?.phone || null,
    },
  });
  if (metaError) {
    return NextResponse.json({ error: metaError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    garageId: garage.id,
    name: garage.name,
    services: garage.services,
    next: "/garage/dashboard",
  });
}

function sanitizeServices(input?: Record<string, number>) {
  const base = { ...DEFAULT_GARAGE_SERVICES };
  if (!input || typeof input !== "object") return base;
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(input)) {
    const name = key.trim();
    const price = Number(value);
    if (!name || !Number.isFinite(price) || price < 0) continue;
    out[name] = Math.round(price * 100) / 100;
  }
  return Object.keys(out).length ? out : base;
}
