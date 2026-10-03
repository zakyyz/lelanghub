/**
 * Tipe data kontrak API LelangHub.
 * Semua field yang bisa null/kosong dari backend didefinisikan eksplisit di sini
 * agar frontend wajib menanganinya (TypeScript strict).
 */

/** Tier diskon lot. null artinya barang belum dinilai (belum ada harga pasaran). */
export type Tier = "S" | "A" | "B" | "C" | "D";

/** Sumber lot lelang yang didukung aggregator. */
export type SumberLelang = "DJKN" | "KOELAK" | "IBID";

export interface Lot {
  id: string;
  nama: string;
  kategori: string;
  /** Harga penawaran lelang saat ini (Rupiah). */
  harga_lelang: number;
  /** Harga pasaran barang. Bisa null bila belum di-price. */
  harga_pasaran: number | null;
  /** Persentase diskon (0-100). Bisa null bila belum di-price. */
  diskon_persen: number | null;
  /** Tier hasil kalkulasi diskon. Bisa null bila belum di-price. */
  tier: Tier | null;
  lokasi: string;
  /** Nama KPKNL. Bisa kosong ("") untuk lot non-DJKN. */
  kpknl: string;
  /** ISO date string "YYYY-MM-DD". Bisa string kosong bila tidak ada deadline. */
  deadline: string;
  /** URL sumber asli lot. */
  link: string;
  /**
   * PENTING: ini JSON STRING berisi array URL foto, bukan array langsung.
   * Contoh: "[\"url1\",\"url2\"]". Bisa berupa "[]" atau string tidak valid.
   * Selalu parse lewat parseFoto() di lib/utils.ts dengan try/catch.
   */
  foto: string;
  sumber: string;
  /** Uang jaminan untuk ikut lelang. Bisa null. */
  uang_jaminan: number | null;
  deskripsi: string;
}

/** Response GET /api/lots */
export interface LotsResponse {
  data: Lot[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/** Item response GET /api/kategori */
export interface KategoriItem {
  kategori: string;
  count: number;
}

/** Response GET /api/stats */
export interface StatsResponse {
  total_lots: number;
  by_tier: Record<string, number>;
  by_sumber: Record<string, number>;
}

/** Parameter query untuk GET /api/lots */
export interface LotQueryParams {
  limit?: number;
  page?: number;
  search?: string;
  kategori?: string;
  tier?: string;
  max_harga?: number;
}

/** Hasil kalkulasi countdown deadline (lib/utils.ts hitungCountdown). */
export interface CountdownInfo {
  /** true bila deadline berupa tanggal valid & tidak kosong. */
  valid: boolean;
  /** true bila deadline sudah lewat. */
  expired: boolean;
  /** true bila sisa waktu < 3 hari (dipakai untuk warna merah). */
  urgent: boolean;
  days: number;
  hours: number;
}
