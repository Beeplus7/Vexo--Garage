import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis, CACHE_TTL } from '@/lib/redis';

// Postcodes.io API FREE bulk - 1.7m postcodes FREE - National matching + bot market sequencing by district
export async function GET(req: NextRequest) {
  const postcode = req.nextUrl.searchParams.get('postcode')?.toUpperCase();
  if (!postcode) return NextResponse.json({ error: 'postcode required e.g. OL8 4' }, { status: 400 });

  const cacheKey = `postcode:${postcode}`;
  const cached = await redis.get(cacheKey);
  if (cached) return NextResponse.json(JSON.parse(cached));

  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
    if (!res.ok) {
      // Fallback mock Oldham OL8 4 - 53.54,-2.11
      const mock = {
        postcode,
        district: postcode.split(' ')[0] || 'OL8',
        area: (postcode.split(' ')[0] || 'OL8').replace(/\d/g, '') || 'OL',
        region: 'North West',
        lat: 53.544,
        lng: -2.116,
        source: 'mock - postcodes.io failed',
      };
      await redis.setex(cacheKey, CACHE_TTL.postcode, JSON.stringify(mock));
      return NextResponse.json(mock);
    }

    const json = await res.json();
    const r = json.result;

    // Extract district OL8 from OL8 4AB, area OL, region North West
    const district = postcode.split(' ')[0] || r.outcode;
    const area = district.replace(/\d/g, '');
    const region = r.region || r.country || 'North West';

    // Upsert into postcodes table for national seed - 3000 districts Day1 / 1.7m Month2 bulk FREE
    await prisma.postcode.upsert({
      where: { postcode },
      update: { district, area, region, lat: r.latitude, lng: r.longitude },
      create: { postcode, district, area, region, lat: r.latitude, lng: r.longitude },
    });

    const result = {
      postcode,
      district,
      area,
      region,
      lat: r.latitude,
      lng: r.longitude,
      source: 'Postcodes.io FREE bulk 1.7m',
      note: 'National seed - 3000 districts Day1 fast',
    };

    await redis.setex(cacheKey, CACHE_TTL.postcode, JSON.stringify(result));
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}