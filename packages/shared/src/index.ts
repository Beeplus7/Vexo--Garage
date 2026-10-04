export interface Garage {
  id: string;
  name: string;
  postcode: string;
  district: string; // OL8, M1, E1
  area: string; // OL, M, E
  region: string; // North West, London, Midlands
  lat: number;
  lng: number;
  services: Record<string, number>; // MOT:45, Full Service:189, Tesla Service:249, BMW Repair:350, Brakes:120
  stripeConnectId?: string;
  insuranceVerified: boolean;
  boostActive: boolean;
  postcodeSequenceOrder: number;
  trafficViews: number;
  bookingsCount: number;
  rating: number;
}

export interface Booking {
  id: string;
  reg: string; // OL08 4AB
  postcode: string; // OL8 4
  district: string; // OL8
  service: string; // MOT, Full Service, Tesla Service, BMW Repair, Brakes
  price: number; // 4500 = £45 in pence
  status: 'pending' | 'accepted' | 'proof_uploaded' | 'completed' | 'disputed' | 'refunded';
  stripePaymentIntentId?: string;
  garageId?: string;
  videoProofUrl?: string;
  motCertUrl?: string;
  passportHash?: string;
  commission: number; // 750 = £7.50 = 450 base +200 Shield +100 Passport
}

export interface Vehicle {
  reg: string;
  make?: string;
  model?: string;
  year?: number;
  colour?: string;
  fuelType?: string;
}

export interface MotHistory {
  reg: string;
  expiry: Date;
  mileage?: number;
  advisories?: any;
  district?: string;
}

export interface VideoProof {
  bookingId: string;
  videoUrl: string;
  certUrl?: string;
  aiVerified: boolean;
}

export interface Passport {
  reg: string;
  district?: string;
  ipfsHash?: string;
  history: any;
  resaleValue: number; // 30000 = £300
}

export interface BotMarketSequence {
  district: string;
  area?: string;
  region?: string;
  phoneId: number; // 1-20
  vpnIp: string; // 185.23.40.13 MAN + 87.106.103.43 LON
  searchTerm: string; // Service garage near me M1
  service: string; // MOT £45, Full Service £189, Tesla Service £249, BMW Repair £350, Brakes £120
  signalsPerDay: number; // 72
  keywordVolume: number;
  socialVolume: number;
  totalSellingScore: number; // Keyword + Social
  priority: 'high' | 'med' | 'low';
  week: number; // 1,2,3
}

export interface KeywordResearch {
  district: string;
  keyword: string;
  volume: number;
  cpc?: number;
  competition?: string;
  trend?: string;
  intent?: string;
}

export interface SocialResearch {
  district: string;
  service: string;
  marketplaceListings: number;
  hashtagPosts: number;
  tiktokViews: number;
  twitterMentions: number;
  youtubeViews: number;
  ebayListings: number;
  totalScore: number;
}