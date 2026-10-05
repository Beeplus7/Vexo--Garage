import { NextResponse } from "next/server";

const BASE = "https://api.company-information.service.gov.uk";

/** GET /api/companies-house?number=12345678 — verify company number */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const number = (searchParams.get("number") || "").replace(/\s/g, "");
  const q = (searchParams.get("q") || "").trim();

  const key = process.env.COMPANIES_HOUSE_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "COMPANIES_HOUSE_API_KEY not configured", verified: false },
      { status: 503 },
    );
  }

  const auth =
    "Basic " + Buffer.from(`${key}:`, "utf8").toString("base64");

  try {
    if (number) {
      const res = await fetch(`${BASE}/company/${encodeURIComponent(number)}`, {
        headers: { Authorization: auth },
        next: { revalidate: 3600 },
      });
      if (res.status === 404) {
        return NextResponse.json({
          verified: false,
          number,
          error: "Company not found",
        });
      }
      if (!res.ok) {
        return NextResponse.json(
          { verified: false, error: `Companies House ${res.status}` },
          { status: 502 },
        );
      }
      const data = (await res.json()) as {
        company_number?: string;
        company_name?: string;
        company_status?: string;
        registered_office_address?: { postal_code?: string; locality?: string };
      };
      return NextResponse.json({
        verified: true,
        number: data.company_number || number,
        name: data.company_name,
        status: data.company_status,
        postcode: data.registered_office_address?.postal_code || null,
        locality: data.registered_office_address?.locality || null,
        source: "Companies House",
      });
    }

    if (q) {
      const res = await fetch(
        `${BASE}/search/companies?q=${encodeURIComponent(q)}&items_per_page=5`,
        { headers: { Authorization: auth } },
      );
      if (!res.ok) {
        return NextResponse.json(
          { error: `Companies House search ${res.status}` },
          { status: 502 },
        );
      }
      const data = (await res.json()) as {
        items?: Array<{
          company_number?: string;
          title?: string;
          company_status?: string;
        }>;
      };
      return NextResponse.json({
        ok: true,
        results: (data.items || []).map((i) => ({
          number: i.company_number,
          name: i.title,
          status: i.company_status,
        })),
        source: "Companies House",
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
