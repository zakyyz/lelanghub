/**
 * MOCK API — GET /api/lots/{id}
 * Meniru kontrak backend asli: mengembalikan satu Lot atau 404.
 */
import { NextRequest, NextResponse } from "next/server";
import { SAMPLE_LOTS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const lot = SAMPLE_LOTS.find((item) => item.id === id);
  if (!lot) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }
  return NextResponse.json(lot);
}
