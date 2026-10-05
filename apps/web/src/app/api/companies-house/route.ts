import { NextResponse } from "next/server";
import {
  fetchCompanyProfile,
  hasCompaniesHouseKey,
  searchCompaniesHouse,
} from "@/lib/companies-house";

/**
 * GET /api/companies-house
 * - ?number=12345678 — Company Profile API (verify)
 * - ?q=SERVICE+APARTMENT+LONDON — Search API
 * - ?q=...&active=1 — filter active only (profile enrich)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const number = (searchParams.get("number") || "").replace(/\s/g, "");
  const q = (searchParams.get("q") || "").trim();
  const activeOnly = searchParams.get("active") === "1";

  if (!hasCompaniesHouseKey()) {
    return NextResponse.json(
      { error: "COMPANIES_HOUSE_API_KEY not configured", verified: false },
      { status: 503 },
    );
  }

  try {
    if (number) {
      const data = await fetchCompanyProfile(number);
      if (!data) {
        return NextResponse.json({
          verified: false,
          number,
          error: "Company not found",
        });
      }
      return NextResponse.json({
        verified: true,
        number: data.company_number || number,
        name: data.company_name,
        status: data.company_status,
        type: data.company_type,
        date_of_creation: data.date_of_creation,
        has_been_liquidated: data.has_been_liquidated || false,
        postcode: data.registered_office_address?.postal_code || null,
        locality: data.registered_office_address?.locality || null,
        source: "Companies House Profile API",
      });
    }

    if (q) {
      const search = await searchCompaniesHouse(q, 20);
      if (!search.ok) {
        return NextResponse.json({ error: search.error }, { status: 502 });
      }
      let results = search.items.map((i) => ({
        number: i.company_number,
        name: i.title,
        status: i.company_status,
        type: i.company_type,
        address_snippet: i.address_snippet,
        postcode: i.address?.postal_code || null,
        locality: i.address?.locality || null,
        date_of_creation: i.date_of_creation || null,
      }));

      if (activeOnly) {
        const filtered = [];
        for (const r of results.slice(0, 15)) {
          if (!r.number) continue;
          const profile = await fetchCompanyProfile(r.number);
          const status = (profile?.company_status || r.status || "").toLowerCase();
          if (status !== "active") continue;
          filtered.push({
            ...r,
            name: profile?.company_name || r.name,
            status: profile?.company_status || r.status,
            date_of_creation: profile?.date_of_creation || r.date_of_creation,
            postcode: profile?.registered_office_address?.postal_code || r.postcode,
            locality: profile?.registered_office_address?.locality || r.locality,
            enriched: Boolean(profile),
          });
        }
        results = filtered;
      }

      return NextResponse.json({
        ok: true,
        results,
        total: search.total,
        source: "Companies House Search API",
      });
    }

    return NextResponse.json(
      { error: "number or q required" },
      { status: 400 },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "companies_house_failed" },
      { status: 500 },
    );
  }
}
