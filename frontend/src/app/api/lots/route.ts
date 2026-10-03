/**
 * MOCK API — GET /api/lots
 * Meniru KONTRAK backend asli LelangHub secara identik:
 *   GET /api/lots?limit=50&page=1&search=&kategori=&tier=&max_harga=
 * Dipakai hanya untuk mode demo (NEXT_PUBLIC_API_URL kosong).
 * Ketika .env.local menunjuk ke backend asli, file ini tidak terpakai.
 */
import { NextRequest, NextResponse } from "next/server";
import { SAMPLE_LOTS } from "@/lib/mock-data";
import type { Lot } from "@/types/lot";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const limitRaw = parseInt(sp.get("limit") ?? "50", 10);
  const pageRaw = parseInt(sp.get("page") ?? "1", 10);
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 50;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const search = (sp.get("search") ?? "").trim().toLowerCase();
  const kategori = (sp.get("kategori") ?? "").trim().toLowerCase();
  const tier = (sp.get("tier") ?? "").trim().toUpperCase();
  const maxHargaRaw = Number(sp.get("max_harga") ?? "");
  const maxHarga =
    sp.get("max_harga") !== null &&
    Number.isFinite(maxHargaRaw) &&
    maxHargaRaw > 0
      ? maxHargaRaw
      : null;

  let filtered: Lot[] = SAMPLE_LOTS.filter((lot) => {
    if (search) {
      const haystack = `${lot.nama} ${lot.deskripsi} ${lot.lokasi} ${lot.kategori}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (kategori && lot.kategori.toLowerCase() !== kategori) return false;
    if (tier && lot.tier !== tier) return false;
    if (maxHarga !== null && lot.harga_lelang > maxHarga) return false;
    return true;
  });

  // Urutan stabil: diskon tertinggi dulu (tier null paling akhir), lalu deadline terdekat.
  filtered = [...filtered].sort((a, b) => {
    const da = a.diskon_persen ?? -1;
    const db = b.diskon_persen ?? -1;
    if (db !== da) return db - da;
    return (a.deadline || "9999-12-31").localeCompare(b.deadline || "9999-12-31");
  });

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, pages);
  const start = (safePage - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return NextResponse.json({ data, total, page: safePage, limit, pages });
}
