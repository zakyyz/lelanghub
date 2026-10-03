"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PriceDisplay } from "@/components/PriceDisplay";
import { TierBadge } from "@/components/TierBadge";
import { cn, parseFoto } from "@/lib/utils";
import type { Lot } from "@/types/lot";

const PLACEHOLDER = "/placeholder.svg";

/**
 * Kartu lot untuk grid homepage/kategori/tier.
 * - Foto aspect 4:3 object-cover, placeholder bila foto "[]" / rusak / gagal load.
 * - Nama 2 baris (line-clamp-2), harga lelang bold besar, pasaran strikethrough kecil,
 *   chip diskon + tier badge, lokasi + sumber, countdown deadline (merah < 3 hari).
 * - Hover: border-amber-400/50 + slight scale.
 */
export function LotCard({ lot, className }: { lot: Lot; className?: string }) {
  const fotos = parseFoto(lot.foto);
  const [imgSrc, setImgSrc] = useState<string>(fotos[0] ?? PLACEHOLDER);

  const handleImgError = () => {
    // Cegah loop error: kalau sudah placeholder, diamkan.
    if (imgSrc !== PLACEHOLDER) setImgSrc(PLACEHOLDER);
  };

  return (
    <Link
      href={`/lot/${encodeURIComponent(lot.id)}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-400/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60",
        className
      )}
      aria-label={`Lihat detail lot: ${lot.nama}`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
        <img
          src={imgSrc}
          alt={`Foto lot ${lot.nama}`}
          loading="lazy"
          onError={handleImgError}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2">
          <TierBadge tier={lot.tier} size="sm" />
        </div>
        <div className="absolute right-2 top-2 rounded-full border border-slate-700/60 bg-slate-950/80 px-2 py-0.5 text-[10px] font-medium tracking-wide text-slate-300 backdrop-blur-sm">
          {lot.sumber}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-slate-100">
          {lot.nama}
        </h3>

        <PriceDisplay
          hargaLelang={lot.harga_lelang}
          hargaPasaran={lot.harga_pasaran}
          diskonPersen={lot.diskon_persen}
          size="md"
        />

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-800 pt-3">
          <span className="inline-flex min-w-0 items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{lot.lokasi || "-"}</span>
          </span>
          <CountdownTimer deadline={lot.deadline} />
        </div>
      </div>
    </Link>
  );
}
