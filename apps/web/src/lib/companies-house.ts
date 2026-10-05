const BASE = "https://api.company-information.service.gov.uk";

export function companiesHouseAuthHeader(apiKey = process.env.COMPANIES_HOUSE_API_KEY) {
  if (!apiKey) return null;
  return "Basic " + Buffer.from(`${apiKey}:`, "utf8").toString("base64");
}

export function hasCompaniesHouseKey() {
  return Boolean(process.env.COMPANIES_HOUSE_API_KEY);
}

type SearchItem = {
  company_number?: string;
  title?: string;
  company_status?: string;
  company_type?: string;
  address_snippet?: string;
  address?: {
    postal_code?: string;
    locality?: string;
    region?: string;
  };
  date_of_creation?: string;
};

export async function searchCompaniesHouse(q: string, itemsPerPage = 20) {
  const auth = companiesHouseAuthHeader();
  if (!auth) {
    return { ok: false as const, error: "COMPANIES_HOUSE_API_KEY not configured", items: [] };
  }
  const res = await fetch(
    `${BASE}/search/companies?q=${encodeURIComponent(q)}&items_per_page=${itemsPerPage}`,
    { headers: { Authorization: auth, Accept: "application/json" } },
  );
  if (!res.ok) {
    return { ok: false as const, error: `Companies House ${res.status}`, items: [] };
  }
  const data = (await res.json()) as { items?: SearchItem[]; total_results?: number };
  return {
    ok: true as const,
    total: data.total_results || (data.items || []).length,
    items: data.items || [],
    source: "companies_house_search" as const,
  };
}

export async function fetchCompanyProfile(companyNumber: string) {
  const auth = companiesHouseAuthHeader();
  if (!auth) return null;
  const number = companyNumber.replace(/\s/g, "");
  const res = await fetch(`${BASE}/company/${encodeURIComponent(number)}`, {
    headers: { Authorization: auth, Accept: "application/json" },
  });
  if (!res.ok) return null;
  return (await res.json()) as {
    company_number?: string;
    company_name?: string;
    company_status?: string;
    company_type?: string;
    date_of_creation?: string;
    has_been_liquidated?: boolean;
    registered_office_address?: {
      postal_code?: string;
      locality?: string;
      region?: string;
      address_line_1?: string;
    };
  };
}
