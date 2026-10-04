import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/bot/deployment — phone/VPN allocation from bot_market_sequence (inventory #31).
 * Shopfooty-traffic :4001 remains the LIVE executor — this is the Vexo read surface.
 */
export async function GET(req: NextRequest) {
  try {
    const week = req.nextUrl.searchParams.get("week");
    const where = week ? { week: Number(week) } : {};

    const sequences = await prisma.botMarketSequence.findMany({
      where,
      orderBy: { totalSellingScore: "desc" },
    });

    const totalScore =
      sequences.reduce((sum, s) => sum + s.totalSellingScore, 0) || 30000;

    const deployment = sequences.map((s) => {
      const phones = Math.max(1, Math.round((s.totalSellingScore / totalScore) * 20));
      return {
        district: s.district,
        area: s.area,
        region: s.region,
        week: s.week,
        phoneId: s.phoneId,
        vpnIp: s.vpnIp,
        searchTerm: s.searchTerm,
        service: s.service,
        signalsPerDay: s.signalsPerDay,
        totalSellingScore: s.totalSellingScore,
        priority: s.priority,
        allocatedPhones: phones,
      };
    });

    const shopfooty =
      process.env.NEXT_PUBLIC_SHOPFOOTY_TRAFFIC_URL ||
      "https://shopfooty-traffic.aroleadjo.com";

    return NextResponse.json({
      deployment,
      phoneFarm: {
        count: Number(process.env.PHONE_FARM_COUNT || 20),
        maxConcurrent: Number(process.env.PHONE_FARM_MAX_CONCURRENT || 4),
        signalsPerDay: Number(process.env.SIGNALS_PER_DAY || 72),
        manchesterVpn: process.env.MANCHESTER_CLUSTER_IP || "185.23.40.13",
        londonVpn: process.env.LONDON_VPN_IP || "87.106.103.43",
      },
      executor: {
        keepLive: true,
        url: shopfooty,
        note: "Execution stays on shopfooty-traffic :4001 — do not cross ports with Vexo :3001",
      },
      count: deployment.length,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "deployment_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
