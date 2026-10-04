import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/social/heatmap — double-radar district heatmap (inventory #31). */
export async function GET(req: NextRequest) {
  try {
    const district = req.nextUrl.searchParams.get("district");
    const where = district ? { district } : {};

    const [social, keywords, sequences] = await Promise.all([
      prisma.socialResearch.findMany({
        where,
        orderBy: { totalScore: "desc" },
        take: 100,
      }),
      prisma.keywordResearch.findMany({
        where,
        orderBy: { volume: "desc" },
        take: 200,
      }),
      prisma.botMarketSequence.findMany({
        where,
        orderBy: { totalSellingScore: "desc" },
      }),
    ]);

    const heatmap = sequences.map((s) => ({
      district: s.district,
      area: s.area,
      region: s.region,
      keywordVolume: s.keywordVolume,
      socialVolume: s.socialVolume,
      totalSellingScore: s.totalSellingScore,
      priority: s.priority,
      phones: Math.max(1, Math.round((s.totalSellingScore / 30000) * 20)),
      service: s.service,
      color:
        s.totalSellingScore > 3000
          ? "#0A7A3E"
          : s.totalSellingScore > 1500
            ? "#FF6B00"
            : "#0A66FF",
    }));

    return NextResponse.json({
      heatmap,
      socialCount: social.length,
      keywordCount: keywords.length,
      formula: "Total Selling Score = Keyword Volume + Social Volume",
      source: "bot_market_sequence + keyword_research + social_research",
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "heatmap_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
