/** Stripe catalog IDs created in VisaGuide OS sandbox (test). */
export const STRIPE_CATALOG = {
  mot: { productId: process.env.STRIPE_PRODUCT_MOT || 'prod_VNjftQR2OPxbdY', priceId: process.env.STRIPE_PRICE_MOT || 'price_1UMyC9KFjjrlm6Pqu5E7P66m', unitAmount: 4500 },
  full_service: { productId: process.env.STRIPE_PRODUCT_FULL_SERVICE || 'prod_VNjffAmxVmm4fg', priceId: process.env.STRIPE_PRICE_FULL_SERVICE || 'price_1UMyCAKFjjrlm6PqgfvEcNFA', unitAmount: 18900 },
  tesla_service: { productId: process.env.STRIPE_PRODUCT_TESLA_SERVICE || 'prod_VNjfa6JSgSKw8t', priceId: process.env.STRIPE_PRICE_TESLA_SERVICE || 'price_1UMyCBKFjjrlm6Pq6GgOHpuT', unitAmount: 24900 },
  bmw_repair: { productId: process.env.STRIPE_PRODUCT_BMW_REPAIR || 'prod_VNjf6cUY28Tvsl', priceId: process.env.STRIPE_PRICE_BMW_REPAIR || 'price_1UMyCCKFjjrlm6PquErdr56I', unitAmount: 35000 },
  brakes: { productId: process.env.STRIPE_PRODUCT_BRAKES || 'prod_VNjfjRNfl3kyJs', priceId: process.env.STRIPE_PRICE_BRAKES || 'price_1UMyCDKFjjrlm6PqcgkXbl4R', unitAmount: 12000 },
  boost: { productId: process.env.STRIPE_PRODUCT_BOOST || 'prod_VNjflQf2v0An58', priceId: process.env.STRIPE_PRICE_BOOST || 'price_1UMyCEKFjjrlm6PqFgYUxQ1u', unitAmount: 19900 },
  care: { productId: process.env.STRIPE_PRODUCT_CARE || 'prod_VNjfniscPcO8TY', priceId: process.env.STRIPE_PRICE_CARE || 'price_1UMyCFKFjjrlm6PqqqFvdzvX', unitAmount: 999 },
  shield_fee: { productId: process.env.STRIPE_PRODUCT_SHIELD_FEE || 'prod_VNjf1KS6MsytkA', priceId: process.env.STRIPE_PRICE_SHIELD_FEE || 'price_1UMyCGKFjjrlm6PqZbcZB1zn', unitAmount: 200 },
  passport_fee: { productId: process.env.STRIPE_PRODUCT_PASSPORT_FEE || 'prod_VNjfDP82IMyN8Z', priceId: process.env.STRIPE_PRICE_PASSPORT_FEE || 'price_1UMyCHKFjjrlm6PqJTLJmMon', unitAmount: 100 }
} as const;

export type StripeCatalogKey = keyof typeof STRIPE_CATALOG;

export function priceIdForService(service: string): string | undefined {
  const map: Record<string, StripeCatalogKey> = {
    MOT: "mot",
    "Full Service": "full_service",
    "Tesla Service": "tesla_service",
    "BMW Repair": "bmw_repair",
    Brakes: "brakes",
    Service: "full_service",
  };
  const key = map[service];
  return key ? STRIPE_CATALOG[key].priceId : undefined;
}
