/**
 * MOCK API — GET /api/stats
 * Kontrak backend: { "total_lots": 100, "by_tier": {"S": 25}, "by_sumber": {"DJKN": 100} }
 */
import { NextResponse } from "next/server";
import { SAMPLE_LOTS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const byTier: Record<string, number> = {};
  const bySumber: Record<string, number> = {};

  for (const lot of SAMPLE_LOTS) {
    if (lot.tier) {
      byTier[lot.tier] = (byTier[lot.tier] ?? 0) + 1;
    }
    bySumber[lot.sumber] = (bySumber[lot.sumber] ?? 0) + 1;
  }

  return NextResponse.json({
    total_lots: SAMPLE_LOTS.length,
    by_tier: byTier,
    by_sumber: bySumber,
  });
}
