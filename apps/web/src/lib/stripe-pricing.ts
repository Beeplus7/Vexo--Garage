import { STRIPE_CATALOG, type StripeCatalogKey, priceIdForService } from "@/lib/stripe-catalog";

export const SERVICE_PRICE_PENCE: Record<string, number> = {
  MOT: 4500,
  "Full Service": 18900,
  "Tesla Service": 24900,
  "BMW Repair": 35000,
  Brakes: 12000,
  Service: 18900,
};

export function priceForService(service: string): number {
  return SERVICE_PRICE_PENCE[service] || STRIPE_CATALOG.mot.unitAmount;
}

/** £7.50 on MOT; else 10% + £3 Shield+Passport */
export function commissionForService(service: string, price: number): number {
  return service === "MOT" ? 750 : Math.round(price * 0.1) + 300;
}

export function catalogKeyForService(service: string): StripeCatalogKey | undefined {
  const map: Record<string, StripeCatalogKey> = {
    MOT: "mot",
    "Full Service": "full_service",
    "Tesla Service": "tesla_service",
    "BMW Repair": "bmw_repair",
    Brakes: "brakes",
    Service: "full_service",
  };
  return map[service];
}

export { priceIdForService, STRIPE_CATALOG };
