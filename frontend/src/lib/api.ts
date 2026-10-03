/**
 * Lapisan akses API terpusat LelangHub.
 *
 * ATURAN: semua fetch dari komponen/page WAJIB lewat fungsi di file ini —
 * dilarang fetch tersebar di komponen.
 *
 * Base URL diambil dari NEXT_PUBLIC_API_URL:
 * - Tidak diset                -> default "http://localhost:8000" (backend asli).
 * - Diset string kosong ("")   -> fetch relatif ke origin yang sama
 *                                (dipakai mode demo / mock API bawaan).
 */
import type {
  KategoriItem,
  Lot,
  LotQueryParams,
  LotsResponse,
  StatsResponse,
} from "@/types/lot";

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API_BASE = RAW_BASE.trim().replace(/\/+$/, "");

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...(init?.headers ?? {}) },
      cache: "no-store",
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") throw err;
    throw new ApiError(
      "Tidak dapat terhubung ke server API. Pastikan backend LelangHub sudah berjalan."
    );
  }

  if (!res.ok) {
    throw new ApiError(
      `Server API merespons dengan error (HTTP ${res.status}).`,
      res.status
    );
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError("Response API bukan JSON yang valid.");
  }
}

/** Bangun query string dari parameter, melewati nilai kosong/undefined. */
function buildQuery(params: LotQueryParams): string {
  const sp = new URLSearchParams();
  if (params.limit !== undefined) sp.set("limit", String(params.limit));
  if (params.page !== undefined) sp.set("page", String(params.page));
  if (params.search) sp.set("search", params.search);
  if (params.kategori) sp.set("kategori", params.kategori);
  if (params.tier) sp.set("tier", params.tier);
  if (params.max_harga !== undefined) sp.set("max_harga", String(params.max_harga));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

/** GET /api/lots — daftar lot dengan filter & pagination. */
export async function getLots(
  params: LotQueryParams = {},
  init?: RequestInit
): Promise<LotsResponse> {
  return request<LotsResponse>(`/api/lots${buildQuery(params)}`, init);
}

/** GET /api/lots/{id} — detail satu lot. */
export async function getLotById(
  id: string,
  init?: RequestInit
): Promise<Lot> {
  return request<Lot>(
    `/api/lots/${encodeURIComponent(id)}`,
    init
  );
}

/** GET /api/kategori — daftar kategori + jumlah lot per kategori. */
export async function getKategori(init?: RequestInit): Promise<KategoriItem[]> {
  return request<KategoriItem[]>("/api/kategori", init);
}

/** GET /api/stats — statistik agregat (total, per tier, per sumber). */
export async function getStats(init?: RequestInit): Promise<StatsResponse> {
  return request<StatsResponse>("/api/stats", init);
}
