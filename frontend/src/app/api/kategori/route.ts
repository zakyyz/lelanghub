/**
 * MOCK API — GET /api/kategori
 * Kontrak backend: [{ "kategori": "Elektronik", "count": 25 }, ...]
 */
import { NextResponse } from "next/server";
import { SAMPLE_LOTS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const counts = new Map<string, number>();
  for (const lot of SAMPLE_LOTS) {
    counts.set(lot.kategori, (counts.get(lot.kategori) ?? 0) + 1);
  }
  const data = Array.from(counts.entries())
    .map(([kategori, count]) => ({ kategori, count }))
    .sort((a, b) => b.count - a.count || a.kategori.localeCompare(b.kategori));

  return NextResponse.json(data);
}
