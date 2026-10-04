import { query } from "@/lib/db";
import type { GarageNearRow } from "@/lib/types/db";
import { lookupPostcode } from "./postcodes";

export async function findGaragesNearPostcode(
  postcode: string,
  opts?: { radiusMiles?: number; national?: boolean },
) {
  const place = await lookupPostcode(postcode);
  const radius = opts?.radiusMiles ?? 0.3;
  const national = opts?.national ?? false;

  const result = await query<GarageNearRow>(
    `select * from public.garages_near($1, $2, $3, $4)`,
    [place.lat, place.lng, radius, national],
  );

  return {
    postcode: place,
    garages: result.rows,
  };
}
