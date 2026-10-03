import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { LotBrowser } from "@/components/LotBrowser";

interface KategoriPageProps {
  params: Promise<{ nama: string }>;
}

export async function generateMetadata({
  params,
}: KategoriPageProps): Promise<Metadata> {
  const { nama } = await params;
  return {
    title: `Kategori ${nama}`,
    description: `Kumpulan lot lelang kategori ${nama} dari DJKN, KOELAK, dan IBID beserta tier diskonnya.`,
  };
}

/**
 * Halaman browse dengan kategori terkunci (pre-filter dari path URL).
 * Filter lain (search, tier, max harga, page) tetap lewat query params & shareable.
 * Catatan: params dari Next.js sudah otomatis ter-decode — jangan decode ulang.
 */
export default async function KategoriPage({ params }: KategoriPageProps) {
  const { nama } = await params;

  const banner = (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-amber-400">
          <LayoutGrid className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <div className="text-xs text-slate-500">Kategori</div>
          <h1 className="text-lg font-bold tracking-tight text-slate-100">
            {nama}
          </h1>
        </div>
      </div>
      <Link
        href="/"
        className="text-sm text-slate-400 underline-offset-4 transition-colors hover:text-amber-400 hover:underline"
      >
        Lihat semua kategori
      </Link>
    </div>
  );

  return <LotBrowser lockedKategori={nama} banner={banner} />;
}
