import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis, CACHE_TTL } from '@/lib/redis';

// Haversine distance calculation - 0.3mi matching - No unified API needed MVP - Dashboard Accept/Decline
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3959; // miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// GET /api/garages?postcode=OL8 4&service=MOT&national=true - National sequence Week1 OL+M+BL+SK Week2 B+L+WA Week3 London
export async function GET(req: NextRequest) {
  const postcode = req.nextUrl.searchParams.get('postcode');
  const service = req.nextUrl.searchParams.get('service') || 'MOT';
  const national = req.nextUrl.searchParams.get('national') === 'true';
  
  if (!postcode) return NextResponse.json({ error: 'postcode required' }, { status: 400 });

  const cacheKey = `garages:${postcode}:${service}:${national}`;
  const cached = await redis.get(cacheKey);
  if (cached) return NextResponse.json(JSON.parse(cached));

  // Get lat/lng from postcode
  let lat = 53.544, lng = -2.116, district = 'OL8', area = 'OL', region = 'North West';
  try {
    const pcRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
    if (pcRes.ok) {
      const pcJson = await pcRes.json();
      lat = pcJson.result.latitude;
      lng = pcJson.result.longitude;
      district = postcode.split(' ')[0] || pcJson.result.outcode;
      area = district.replace(/\d/g, '');
      region = pcJson.result.region || 'North West';
    }
  } catch {}

  // Prefer nearby by district, then expand to all garages sorted by Haversine
  let garages = await prisma.garage.findMany({
    where: national ? undefined : { district },
    take: national ? 100 : 30,
  });

  if (garages.length === 0) {
    garages = await prisma.garage.findMany({ take: 50 });
  }

  // If no garages in DB yet, return mock 3 garages Oldham example
  if (garages.length === 0) {
    const mockGarages = [
      { id: '1', name: 'A1 Motors Oldham', postcode: 'OL8 4AB', district: 'OL8', area: 'OL', region: 'North West', lat: 53.544, lng: -2.116, distance: 0.3, services: { MOT: 45, 'Full Service': 189, 'Tesla Service': 249, 'BMW Repair': 350, Brakes: 120 }, rating: 4.9, bookingsCount: 124, trafficViews: 340, boostActive: true },
      { id: '2', name: 'Oldham Autocentre', postcode: 'OL8 2JG', district: 'OL8', area: 'OL', region: 'North West', lat: 53.545, lng: -2.118, distance: 0.5, services: { MOT: 49, 'Full Service': 199, Brakes: 120 }, rating: 4.7, bookingsCount: 89, trafficViews: 210, boostActive: false },
      { id: '3', name: 'Kwik Fit Oldham', postcode: 'OL8 1LD', district: 'OL8', area: 'OL', region: 'North West', lat: 53.543, lng: -2.11, distance: 0.7, services: { MOT: 55, 'Full Service': 209, 'Tesla Service': 269 }, rating: 4.5, bookingsCount: 67, trafficViews: 180, boostActive: true },
    ];

    // Calculate real distance
    const withDistance = mockGarages.map(g => ({
      ...g,
      distance: Number(haversine(lat, lng, g.lat, g.lng).toFixed(1)),
      servicePrice: (g.services as any)[service] || 45,
    })).sort((a,b) => a.distance - b.distance);

    await redis.setex(cacheKey, CACHE_TTL.garages, JSON.stringify(withDistance));
    return NextResponse.json({ garages: withDistance, source: 'mock - seed garages table for live', district, area, region, lat, lng, note: 'National sequencing Week1 OL+M+BL+SK Week2 B+L+WA Week3 London E+NW+SE+SW' });
  }

  const withDistance = garages.map(g => ({
    ...g,
    distance: Number(haversine(lat, lng, g.lat, g.lng).toFixed(1)),
    servicePrice: (g.services as any)[service] || 45,
  })).sort((a,b) => a.distance - b.distance);

  const nearby = withDistance.filter(g => g.distance <= 15);
  const result = nearby.length ? nearby : withDistance.slice(0, 20);

  await redis.setex(cacheKey, CACHE_TTL.garages, JSON.stringify(result));
  return NextResponse.json({ garages: result, district, area, region, lat, lng, source: 'Supabase Postgres national' });
}