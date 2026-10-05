const BASE = process.env.POSTCODES_IO_BASE || "https://api.postcodes.io";

export type PostcodeGeo = {
  postcode: string;
  outcode: string;
  district: string;
  lat: number;
  lng: number;
  region: string | null;
  source: string;
};

function haversineMi(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function lookupPostcode(postcode: string): Promise<PostcodeGeo | null> {
  const pc = postcode.trim().toUpperCase();
  if (!pc) return null;
  try {
    const res = await fetch(`${BASE}/postcodes/${encodeURIComponent(pc)}`);
    if (!res.ok) {
      // Try outcode (e.g. SW1)
      const out = await fetch(`${BASE}/outcodes/${encodeURIComponent(pc.split(/\s+/)[0])}`);
      if (!out.ok) return null;
      const oj = (await out.json()) as {
        result?: { outcode: string; latitude: number; longitude: number; admin_district?: string[] };
      };
      if (!oj.result) return null;
      return {
        postcode: oj.result.outcode,
        outcode: oj.result.outcode,
        district: oj.result.outcode,
        lat: oj.result.latitude,
        lng: oj.result.longitude,
        region: oj.result.admin_district?.[0] || null,
        source: "Postcodes.io outcodes",
      };
    }
    const json = (await res.json()) as {
      result?: {
        postcode: string;
        outcode: string;
        latitude: number;
        longitude: number;
        region?: string;
      };
    };
    if (!json.result) return null;
    return {
      postcode: json.result.postcode,
      outcode: json.result.outcode,
      district: json.result.outcode,
      lat: json.result.latitude,
      lng: json.result.longitude,
      region: json.result.region || null,
      source: "Postcodes.io",
    };
  } catch {
    return null;
  }
}

/** Resolve postcode geo for a free-text UK postcode in an address snippet. */
export async function distanceMiFromAddress(
  focus: PostcodeGeo,
  addressSnippet: string | null | undefined,
): Promise<number | null> {
  if (!addressSnippet) return null;
  const match = addressSnippet.match(
    /\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}|[A-Z]{1,2}\d[A-Z\d]?)\b/i,
  );
  if (!match) return null;
  const geo = await lookupPostcode(match[1]);
  if (!geo) return null;
  return Number(haversineMi(focus.lat, focus.lng, geo.lat, geo.lng).toFixed(1));
}

export { haversineMi };
