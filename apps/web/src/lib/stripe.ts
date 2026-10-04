import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      // Production package pin; cast for Stripe SDK version drift
      apiVersion: "2024-06-20" as never,
    });
  }
  return stripeClient;
}

/** Lazy proxy so importing routes does not crash without Stripe keys. */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const client = getStripe() as unknown as Record<PropertyKey, unknown>;
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export const VEXO_COMMISSION = {
  base: 450, // £4.50 10%
  shield: 200, // £2.00
  passport: 100, // £1.00
  total: 750, // £7.50
};

export const GARAGE_SHARE = 4050; // £40.50 90% of £45 MOT
