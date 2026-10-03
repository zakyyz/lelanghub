import Link from "next/link";
import { Gavel } from "lucide-react";

/** Halaman 404 kustom bertema dark (mis. /tier/X dengan tier tidak valid). */
export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 py-24 text-center sm:px-6">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-amber-400">
        <Gavel className="h-8 w-8" aria-hidden />
      </span>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-50">
          404 — Halaman Tidak Ditemukan
        </h1>
        <p className="mx-auto max-w-md text-sm text-slate-400">
          Lot, kategori, atau tier yang kamu cari tidak ada atau sudah dihapus.
          Coba mulai lagi dari beranda untuk melihat semua lelang aktif.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex h-10 items-center rounded-md bg-amber-400 px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
