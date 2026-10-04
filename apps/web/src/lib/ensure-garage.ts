import { prisma } from "@/lib/prisma";

const MOCK_SEED: Record<
  string,
  {
    name: string;
    postcode: string;
    district: string;
    area: string;
    region: string;
    lat: number;
    lng: number;
    phone?: string;
    email?: string;
    services: Record<string, number>;
  }
> = {
  "1": {
    name: "A1 Motors Oldham",
    postcode: "OL8 4AB",
    district: "OL8",
    area: "OL",
    region: "North West",
    lat: 53.544,
    lng: -2.116,
    phone: "+441611234567",
    email: "a1@vexogarage.co.uk",
    services: {
      MOT: 45,
      "Full Service": 189,
      "Tesla Service": 249,
      "BMW Repair": 350,
      Brakes: 120,
    },
  },
  "2": {
    name: "Oldham Autocentre",
    postcode: "OL8 2JG",
    district: "OL8",
    area: "OL",
    region: "North West",
    lat: 53.545,
    lng: -2.118,
    phone: "+441617654321",
    email: "autocentre@vexogarage.co.uk",
    services: { MOT: 49, "Full Service": 199, Brakes: 120 },
  },
  "3": {
    name: "Kwik Fit Oldham",
    postcode: "OL8 1LD",
    district: "OL8",
    area: "OL",
    region: "North West",
    lat: 53.543,
    lng: -2.11,
    phone: "+441619998877",
    email: "kwikfit@vexogarage.co.uk",
    services: { MOT: 55, "Full Service": 209, "Tesla Service": 269 },
  },
};

/** Resolve garage; seed mock OL8 garages when checkout hits demo ids. */
export async function ensureGarage(garageId: string) {
  const existing = await prisma.garage.findUnique({ where: { id: garageId } });
  if (existing) return existing;

  const seed = MOCK_SEED[garageId];
  if (!seed) return null;

  // Prefer find-by-name+postcode so re-runs don't collide on fixed demo ids
  const byName = await prisma.garage.findFirst({
    where: { name: seed.name, postcode: seed.postcode },
  });
  if (byName) return byName;

  try {
    return await prisma.garage.create({
      data: {
        id: garageId,
        name: seed.name,
        postcode: seed.postcode,
        district: seed.district,
        area: seed.area,
        region: seed.region,
        lat: seed.lat,
        lng: seed.lng,
        phone: seed.phone,
        email: seed.email,
        services: seed.services,
        boostActive: garageId === "1" || garageId === "3",
        insuranceVerified: true,
        motLicenseVerified: true,
        companiesHouseVerified: true,
        postcodeSequenceOrder: Number(garageId),
        trafficViews: garageId === "1" ? 340 : 180,
        bookingsCount: 0,
        rating: 4.8,
      },
    });
  } catch {
    return prisma.garage.findFirst({
      where: { name: seed.name, postcode: seed.postcode },
    });
  }
}
