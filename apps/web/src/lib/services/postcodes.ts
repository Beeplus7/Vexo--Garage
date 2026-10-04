import { query } from "@/lib/db";
import type { PostcodeRow } from "@/lib/types/db";

const POSTCODES_IO =
  process.env.POSTCODES_IO_BASE || "https://api.postcodes.io";

export function normalizePostcode(input: string) {
  return input.replace(/\s+/g, "").toUpperCase();
}

export async function lookupPostcode(input: string): Promise<PostcodeRow> {
  const cleaned = input.trim();
  if (!cleaned) {
    throw new Error("Postcode is required");
  }

  const norm = normalizePostcode(cleaned);

  const cached = await query<PostcodeRow>(
    `select id, postcode, postcode_norm, district, area, region, lat, lng
     from public.postcodes
     where postcode_norm = $1
     limit 1`,
    [norm],
  );

  if (cached.rows[0]) {
    return cached.rows[0];
  }

  const res = await fetch(
    `${POSTCODES_IO}/postcodes/${encodeURIComponent(cleaned)}`,
    { next: { revalidate: 86400 } },
  );

  if (!res.ok) {
    throw new Error(`Postcode lookup failed (${res.status})`);
  }

  const body = (await res.json()) as {
    result?: {
      postcode: string;
      outcode: string;
      incode: string;
      latitude: number;
      longitude: number;
      region?: string;
      admin_district?: string;
      parliamentary_constituency?: string;
    };
  };

  if (!body.result) {
    throw new Error("Postcode not found");
  }

  const r = body.result;
  const district = r.outcode;
  const area = r.outcode.replace(/\d.*/, "");

  const inserted = await query<PostcodeRow>(
    `insert into public.postcodes (postcode, district, area, region, lat, lng)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (postcode_norm) do update set
       district = excluded.district,
       area = excluded.area,
       region = excluded.region,
       lat = excluded.lat,
       lng = excluded.lng,
       updated_at = now()
     returning id, postcode, postcode_norm, district, area, region, lat, lng`,
    [
      r.postcode,
      district,
      area,
      r.region ?? r.admin_district ?? null,
      r.latitude,
      r.longitude,
    ],
  );

  return inserted.rows[0];
}
