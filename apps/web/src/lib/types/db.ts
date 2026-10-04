export type GarageStatus = "pending" | "active" | "suspended" | "rejected";

export type BookingStatus =
  | "pending_payment"
  | "held"
  | "accepted"
  | "declined"
  | "in_progress"
  | "awaiting_proof"
  | "awaiting_approval"
  | "completed"
  | "disputed"
  | "cancelled"
  | "refunded";

export type ServiceType =
  | "mot"
  | "service"
  | "diagnostics"
  | "tyres"
  | "brakes"
  | "other";

export interface PostcodeRow {
  id: string;
  postcode: string;
  postcode_norm: string;
  district: string;
  area: string | null;
  region: string | null;
  lat: number;
  lng: number;
}

export interface GarageRow {
  id: string;
  name: string;
  slug: string;
  postcode: string;
  district: string | null;
  lat: number | null;
  lng: number | null;
  base_mot_price_pence: number;
  status: GarageStatus;
}

export interface GarageNearRow extends GarageRow {
  distance_miles: number;
}
