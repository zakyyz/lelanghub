"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Check,
  ExternalLink,
  ImageIcon,
  MapPin,
  Share2,
  Wallet,
} from "lucide-react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ErrorState } from "@/components/ErrorState";
import { PriceDisplay } from "@/components/PriceDisplay";
import { TierBadge } from "@/components/TierBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, getLotById } from "@/lib/api";
import { cn, formatDateID, formatRupiah, parseFoto } from "@/lib/utils";
import type { Lot } from "@/types/lot";

const PLACEHOLDER = "/placeholder.svg";

interface LotDetailProps {
  id: string;
}

/** Baris info kecil di kotak informasi. */
function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-slate-500">
          {label}
        </div>
        <div className="break-words text-sm font-medium text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Skeleton layout detail saat loading. */
function LotDetailSkeleton() {
  return (
    <div
      className="mt-6 grid gap-8 lg:grid-cols-2"
      aria-busy="true"
      aria-label="Memuat detail lot"
    >
      <div className="space-y-3">
        <Skeleton className="aspect-[4/3] w-full rounded-xl bg-slate-800" />
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-lg bg-slate-800" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full bg-slate-800" />
          <Skeleton className="h-6 w-20 rounded-full bg-slate-800" />
        </div>
        <Skeleton className="h-8 w-4/5 bg-slate-800" />
        <Skeleton className="h-10 w-1/2 bg-slate-800" />
        <Skeleton className="h-40 w-full rounded-xl bg-slate-800" />
        <Skeleton className="h-24 w-full rounded-xl bg-slate-800" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-44 rounded-md bg-slate-800" />
          <Skeleton className="h-10 w-32 rounded-md bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

/**
 * Halaman detail lot:
 * - Galeri foto dari parseFoto(JSON string), placeholder bila kosong/gagal.
 * - Harga lelang besar + pasaran strikethrough + diskon + tier badge besar.
 * - Info box: lokasi, KPKNL, uang jaminan, deadline + countdown.
 * - Tombol "Buka Sumber Asli" (target _blank) + tombol share (copy link).
 */
export function LotDetail({ id }: LotDetailProps) {
  const lotQuery = useQuery({
    queryKey: ["lot", id],
    queryFn: ({ signal }) => getLotById(id, { signal }),
    retry: (failureCount, error) => {
      // 404 = lot memang tidak ada — jangan retry.
      if (error instanceof ApiError && error.status === 404) return false;
      return failureCount < 1;
    },
  });

  const lot: Lot | null = lotQuery.data ?? null;
  const loading = lotQuery.isPending;
  const notFound =
    lotQuery.isError && lotQuery.error instanceof ApiError
      ? lotQuery.error.status === 404
      : false;
  const error = lotQuery.isError
    ? lotQuery.error instanceof Error
      ? lotQuery.error.message
      : "Terjadi kesalahan tak terduga."
    : null;

  // Reset pilihan foto saat pindah lot (pola adjust-state-during-render).
  const [lastId, setLastId] = useState(id);
  const [activeFoto, setActiveFoto] = useState(0);
  const [copied, setCopied] = useState(false);
  if (lastId !== id) {
    setLastId(id);
    setActiveFoto(0);
  }

  const fotos = lot ? parseFoto(lot.foto) : [];
  const currentFoto = fotos[activeFoto] ?? PLACEHOLDER;

  const handleImgError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    if (e.currentTarget.src.endsWith(PLACEHOLDER)) return;
    e.currentTarget.src = PLACEHOLDER;
  };

  const handleCopyLink = useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback untuk konteks non-secure / browser lama.
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Biarkan tombol kembali normal bila clipboard ditolak browser.
      setCopied(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6">
        <LotDetailSkeleton />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-16 sm:px-6">
        <ErrorState
          title="Lot Tidak Ditemukan"
          message={`Lot dengan id "${id}" tidak ada atau sudah dihapus dari server.`}
          onRetry={() => void lotQuery.refetch()}
        />
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-slate-400 underline-offset-4 hover:text-amber-400 hover:underline"
          >
            Kembali ke beranda
          </Link>
        </div>
      </div>
    );
  }

  if (error || !lot) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-16 sm:px-6">
        <ErrorState
          message={error ?? "Data lot tidak tersedia."}
          onRetry={() => void lotQuery.refetch()}
        />
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-slate-400 underline-offset-4 hover:text-amber-400 hover:underline"
          >
            Kembali ke beranda
          </Link>
        </div>
      </div>
    );
  }

  const savings =
    lot.harga_pasaran !== null && lot.harga_pasaran !== undefined
      ? Math.max(lot.harga_pasaran - lot.harga_lelang, 0)
      : 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-amber-400"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke daftar lelang
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-2">
        {/* ==== Galeri foto ==== */}
        <section aria-label="Galeri foto lot">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <img
              src={currentFoto}
              alt={`Foto ${fotos.length > 1 ? activeFoto + 1 + " dari " + fotos.length + " " : ""}lot ${lot.nama}`}
              onError={handleImgError}
              className="h-full w-full object-cover"
            />
          </div>
          {fotos.length > 1 && (
            <div
              className="mt-3 grid grid-cols-5 gap-2"
              role="tablist"
              aria-label="Pilih foto"
            >
              {fotos.slice(0, 10).map((url, idx) => (
                <button
                  key={`${url}-${idx}`}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeFoto}
                  aria-label={`Foto ${idx + 1}`}
                  onClick={() => setActiveFoto(idx)}
                  className={cn(
                    "aspect-[4/3] overflow-hidden rounded-lg border-2 transition-colors",
                    idx === activeFoto
                      ? "border-amber-400"
                      : "border-slate-800 opacity-70 hover:opacity-100"
                  )}
                >
                  <img
                    src={url}
                    alt=""
                    onError={handleImgError}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          {fotos.length === 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
              <ImageIcon className="h-3.5 w-3.5" aria-hidden />
              Lot ini belum memiliki foto dari sumber aslinya.
            </p>
          )}
        </section>

        {/* ==== Informasi utama ==== */}
        <section className="flex min-w-0 flex-col gap-5" aria-label="Detail lot">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/kategori/${encodeURIComponent(lot.kategori)}`}>
              <Badge
                variant="outline"
                className="border-slate-700 bg-slate-900 text-slate-300 hover:border-amber-400/50 hover:text-amber-300"
              >
                {lot.kategori}
              </Badge>
            </Link>
            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
              Sumber: {lot.sumber}
            </Badge>
            <TierBadge tier={lot.tier} size="lg" />
          </div>

          <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-50 sm:text-3xl">
            {lot.nama}
          </h1>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Harga Lelang
            </div>
            <PriceDisplay
              hargaLelang={lot.harga_lelang}
              hargaPasaran={lot.harga_pasaran}
              diskonPersen={lot.diskon_persen}
              size="xl"
              className="mt-1"
            />
            {lot.harga_pasaran !== null && lot.harga_pasaran !== undefined && (
              <p className="mt-2 text-xs text-slate-500">
                Dibandingkan harga pasaran ({formatRupiah(lot.harga_pasaran)})
                {savings > 0 && ` — kamu hemat ${formatRupiah(savings)}`}
              </p>
            )}
          </div>

          <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 sm:grid-cols-2">
            <InfoRow icon={MapPin} label="Lokasi">
              {lot.lokasi || "-"}
            </InfoRow>
            <InfoRow icon={Building2} label="KPKNL / Balai Lelang">
              {lot.kpknl || "-"}
            </InfoRow>
            <InfoRow icon={Wallet} label="Uang Jaminan">
              {lot.uang_jaminan !== null && lot.uang_jaminan !== undefined
                ? formatRupiah(lot.uang_jaminan)
                : "Tidak ada"}
            </InfoRow>
            <InfoRow icon={CalendarClock} label="Deadline Lelang">
              {lot.deadline ? (
                <span className="flex flex-col gap-0.5">
                  <span>{formatDateID(lot.deadline)}</span>
                  <CountdownTimer deadline={lot.deadline} />
                </span>
              ) : (
                "Tidak ada (lelang terbuka)"
              )}
            </InfoRow>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Deskripsi
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">
              {lot.deskripsi || "Tidak ada deskripsi untuk lot ini."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              className="h-11 bg-amber-400 px-5 font-semibold text-slate-950 hover:bg-amber-300"
            >
              <a href={lot.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" aria-hidden />
                Buka Sumber Asli
              </a>
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="h-11 border-slate-700 bg-slate-900 px-5 text-slate-200 hover:border-amber-400/50 hover:bg-slate-800 hover:text-amber-300"
              aria-live="polite"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" aria-hidden />
                  Tautan Disalin!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" aria-hidden />
                  Bagikan Lot
                </>
              )}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
