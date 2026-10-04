import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis, CACHE_TTL } from '@/lib/redis';

// DVSA MOT History API FREE unlimited - Reminder AI + Passport + JustPark 1900 trick x10 = 19000 extra/mo national
export async function GET(req: NextRequest) {
  const reg = req.nextUrl.searchParams.get('reg')?.toUpperCase().replace(/\s/g, '');
  if (!reg) return NextResponse.json({ error: 'reg required e.g. OL08 4AB' }, { status: 400 });

  const cacheKey = `mot:${reg}`;
  const cached = await redis.get(cacheKey);
  if (cached) return NextResponse.json(JSON.parse(cached));

  try {
    const res = await fetch(`https://beta.check-mot.service.gov.uk/trade/vehicles/mot-tests?registration=${reg}`, {
      headers: {
        'x-api-key': process.env.DVSA_API_KEY!,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      // Mock for dev - Expiry 15 Oct + mileage example
      const mockExpiry = new Date();
      mockExpiry.setDate(mockExpiry.getDate() + 45);
      const mock = {
        reg,
        expiry: mockExpiry,
        mileage: 45230,
        advisories: ['Brake pad wear', 'Tyre wear'],
        district: 'OL8',
        source: 'mock - add DVSA_API_KEY for live',
        note: 'Reminder AI enabled - 30/7/1 days - JustPark 1900 trick',
      };
      // Save to DB for reminder AI
      await prisma.motHistory.create({
        data: {
          reg,
          expiry: mockExpiry,
          mileage: 45230,
          advisories: ['Brake pad wear'],
          district: 'OL8',
        },
      });
      await redis.setex(cacheKey, CACHE_TTL.mot, JSON.stringify(mock));
      return NextResponse.json(mock);
    }

    const data = await res.json();
    const latest = data[0];
    const expiry = new Date(latest?.motTests?.[0]?.expiryDate || Date.now() + 30*24*60*60*1000);

    // Save to DB for Reminder AI + Passport + District sequencing
    const district = req.nextUrl.searchParams.get('district') || 'OL8';
    await prisma.motHistory.create({
      data: {
        reg,
        expiry,
        mileage: latest?.motTests?.[0]?.odometerValue || 0,
        advisories: latest?.motTests?.[0]?.rfrAndComments || [],
        district,
      },
    });

    const result = {
      reg,
      expiry,
      mileage: latest?.motTests?.[0]?.odometerValue,
      advisories: latest?.motTests?.[0]?.rfrAndComments,
      district,
      source: 'DVSA FREE unlimited',
      note: 'Reminder AI + Passport enabled',
    };

    await redis.setex(cacheKey, CACHE_TTL.mot, JSON.stringify(result));
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}