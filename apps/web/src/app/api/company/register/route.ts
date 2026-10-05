import { NextRequest, NextResponse } from "next/server";
import {
  fetchCompanyProfile,
  hasCompaniesHouseKey,
  searchCompaniesHouse,
} from "@/lib/companies-house";
import { distanceMiFromAddress, lookupPostcode } from "@/lib/postcodes";
import { prisma } from "@/lib/prisma";

const SHOPFOOTY =
  process.env.NEXT_PUBLIC_SHOPFOOTY_TRAFFIC_URL ||
  "https://shopfooty-traffic.aroleadjo.com";

/**
 * GET/POST /api/company/register
 * Live company listing via Companies House + Postcodes.io radius.
 * Bridges to Shopfooty Keyword Layer company-register (KEEP LIVE :4001).
 *
 * Query/body: keyword, location, postcode, radius_mi, autorun=1
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  return runRegister({
    keyword: sp.get("keyword") || "MOT garage",
    location: sp.get("location") || "London",
    postcode: sp.get("postcode") || "SW1",
    radius_mi: Number(sp.get("radius_mi") || 22),
    autorun: sp.get("autorun") === "1",
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  return runRegister({
    keyword: String(body.keyword || body.search_term || "MOT garage"),
    location: String(body.location || body.area || "London"),
    postcode: String(body.postcode || "SW1"),
    radius_mi: Number(body.radius_mi || body.radius || 22),
    autorun: Boolean(body.autorun),
  });
}

async function runRegister(input: {
  keyword: string;
  location: string;
  postcode: string;
  radius_mi: number;
  autorun: boolean;
}) {
  const keyword = input.keyword.trim();
  const location = input.location.trim();
  const postcode = input.postcode.trim().toUpperCase();
  const radius_mi = Number.isFinite(input.radius_mi) ? input.radius_mi : 22;

  const geo = await lookupPostcode(postcode);
  if (!geo) {
    return NextResponse.json(
      { error: "postcode_lookup_failed", postcode, note: "Postcodes.io required for radius_mi" },
      { status: 400 },
    );
  }

  const chQuery = `${keyword} ${location}`;
  const search = await searchCompaniesHouse(chQuery, 40);

  let companies: Array<Record<string, unknown>> = [];
  let source = "mock";

  if (search.ok && search.items.length) {
    source = "companies_house";
    const enriched = [];
    for (const item of search.items.slice(0, 25)) {
      const number = item.company_number || "";
      const profile = number ? await fetchCompanyProfile(number) : null;
      const status = (profile?.company_status || item.company_status || "").toLowerCase();
      if (status && status !== "active") continue;

      const address =
        item.address_snippet ||
        [
          profile?.registered_office_address?.address_line_1,
          profile?.registered_office_address?.locality,
          profile?.registered_office_address?.postal_code,
        ]
          .filter(Boolean)
          .join(", ");

      const dist = await distanceMiFromAddress(geo, address);
      if (dist != null && dist > radius_mi) continue;

      enriched.push({
        company_number: number,
        company_name: profile?.company_name || item.title,
        company_status: profile?.company_status || item.company_status || "active",
        company_type: profile?.company_type || item.company_type,
        date_of_creation: profile?.date_of_creation || item.date_of_creation || null,
        address_snippet: address,
        postcode: profile?.registered_office_address?.postal_code || item.address?.postal_code || null,
        locality: profile?.registered_office_address?.locality || item.address?.locality || null,
        distance_mi: dist,
        in_radius: dist == null || dist <= radius_mi,
        companies_house_url: number
          ? `https://find-and-update.company-information.service.gov.uk/company/${number}`
          : null,
        source: "companies_house_live",
      });
    }
    companies = enriched;
  }

  // Optional Google Places double-radar
  let places: Array<Record<string, unknown>> = [];
  const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
  if (mapsKey) {
    try {
      const url =
        `https://maps.googleapis.com/maps/api/place/textsearch/json` +
        `?query=${encodeURIComponent(`${keyword} ${location}`)}` +
        `&location=${geo.lat},${geo.lng}` +
        `&radius=${Math.round(radius_mi * 1609.34)}` +
        `&key=${mapsKey}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = (await res.json()) as {
          results?: Array<{
            place_id?: string;
            name?: string;
            formatted_address?: string;
            business_status?: string;
            rating?: number;
            user_ratings_total?: number;
          }>;
        };
        places = (data.results || [])
          .filter((p) => !p.business_status || p.business_status === "OPERATIONAL")
          .slice(0, 20)
          .map((p) => ({
            place_id: p.place_id,
            name: p.name,
            formatted_address: p.formatted_address,
            business_status: p.business_status || "OPERATIONAL",
            rating: p.rating,
            user_ratings_total: p.user_ratings_total,
            source: "google_places",
          }));
      }
    } catch {
      // optional
    }
  }

  // Bridge to Shopfooty company-register (KEEP LIVE) — write bot_market when autorun
  let shopfooty: Record<string, unknown> | null = null;
  try {
    const sfRes = await fetch(`${SHOPFOOTY}/api/company/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keyword,
        location,
        postcode,
        radius_mi,
        autorun: input.autorun,
      }),
    });
    if (sfRes.ok) {
      shopfooty = (await sfRes.json()) as Record<string, unknown>;
      // Prefer Shopfooty companies if it returned live CH list
      const sfCompanies = (shopfooty.companies ||
        shopfooty.companies_in_radius) as Array<Record<string, unknown>> | undefined;
      const depth = shopfooty.depth as { companies_house?: { source?: string } } | undefined;
      if (
        sfCompanies?.length &&
        depth?.companies_house?.source === "companies_house"
      ) {
        companies = sfCompanies;
        source = "shopfooty_companies_house";
      }
    }
  } catch {
    shopfooty = { error: "shopfooty_unreachable", keep_live: true, url: SHOPFOOTY };
  }

  if (input.autorun) {
    try {
      const district = geo.district;
      const existing = await prisma.botMarketSequence.findFirst({
        where: { district },
        orderBy: { createdAt: "desc" },
      });
      const payload = {
        searchTerm: `${keyword} ${postcode}`,
        service: keyword,
        keywordVolume: companies.length * 100,
        socialVolume: places.length * 50,
        totalSellingScore: companies.length * 100 + places.length * 50,
        priority: companies.length >= 8 ? "high" : "med",
        status: "active" as const,
      };
      if (existing) {
        await prisma.botMarketSequence.update({
          where: { id: existing.id },
          data: payload,
        });
      } else {
        await prisma.botMarketSequence.create({
          data: {
            district,
            area: district.replace(/\d/g, "") || district,
            region: geo.region || location,
            phoneId: 1,
            vpnIp: process.env.LONDON_VPN_IP || "87.106.103.43",
            signalsPerDay: 72,
            week: 3,
            ...payload,
          },
        });
      }
    } catch {
      // non-fatal — Shopfooty owns live bot_market executor
    }
  }

  return NextResponse.json({
    ok: true,
    layer: "company-register",
    keyword,
    location,
    postcode,
    radius_mi,
    focus: geo,
    companies_house: {
      enabled: hasCompaniesHouseKey(),
      query: chQuery,
      total_results: search.ok ? search.total : 0,
      error: search.ok ? null : search.error,
      source,
    },
    google_places: {
      enabled: Boolean(mapsKey),
      count: places.length,
      note: mapsKey
        ? "live Places double-radar"
        : "optional — set GOOGLE_MAPS_API_KEY for operational listings + ratings",
    },
    companies,
    places,
    count: companies.length,
    autorun: input.autorun,
    shopfooty: {
      keep_live: true,
      url: `${SHOPFOOTY}/company-register/?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}&postcode=${encodeURIComponent(postcode)}&radius_mi=${radius_mi}&autorun=${input.autorun ? 1 : 0}`,
      api: `${SHOPFOOTY}/api/company/research`,
      bridge: shopfooty
        ? {
            ok: !(shopfooty as { error?: string }).error,
            source: (shopfooty as { depth?: { companies_house?: { source?: string } } }).depth
              ?.companies_house?.source,
            register_listed: Array.isArray(
              (shopfooty as { companies?: unknown[] }).companies,
            )
              ? (shopfooty as { companies: unknown[] }).companies.length
              : null,
          }
        : null,
    },
    note: hasCompaniesHouseKey()
      ? "Live Companies House + Postcodes.io radius — active only"
      : "COMPANIES_HOUSE_API_KEY missing — listing stale without Gov API",
  });
}
