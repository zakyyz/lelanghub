"use client";

import { useRef, useState } from "react";
import { LayoutGrid, Lock, RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { getTierMeta } from "@/components/TierBadge";
import { cn, formatRupiah } from "@/lib/utils";
import type { KategoriItem } from "@/types/lot";

const TIER_ORDER = ["S", "A", "B", "C", "D"] as const;
const MAX_HARGA_SLIDER = 500_000_000;
const STEP_HARGA = 5_000_000;

export interface ActiveFilters {
  search: string;
  kategori: string;
  tier: string;
  /** null = tanpa batas harga (slider di posisi 0 / "Semua"). */
  maxHarga: number | null;
}

interface FilterSidebarProps {
  filters: ActiveFilters;
  kategoriList: KategoriItem[];
  kategoriLoading?: boolean;
  /** Kategori terkunci dari path URL (halaman /kategori/[nama]). */
  lockedKategori?: string;
  /** Tier terkunci dari path URL (halaman /tier/[tier]). */
  lockedTier?: string;
  onSearchChange: (value: string) => void;
  onKategoriChange: (value: string) => void;
  onTierChange: (value: string) => void;
  onMaxHargaChange: (value: number | null) => void;
  onReset: () => void;
  className?: string;
}

/**
 * Sidebar filter lengkap: keyword, kategori (+count dari API), tier, max harga.
 * Dipakai di desktop (aside sticky) maupun mobile (isi drawer Sheet).
 */
export function FilterSidebar({
  filters,
  kategoriList,
  kategoriLoading = false,
  lockedKategori,
  lockedTier,
  onSearchChange,
  onKategoriChange,
  onTierChange,
  onMaxHargaChange,
  onReset,
  className,
}: FilterSidebarProps) {
  // Keyword didebounce lokal supaya URL tidak update di setiap ketikan.
  // Sinkronisasi draft dengan filter dari URL memakai pola "adjust state during render"
  // (rekomendasi React menggantikan efek setState) supaya tetap responsif saat
  // user datang dari link share / menekan reset filter.
  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [lastUrlSearch, setLastUrlSearch] = useState(filters.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (lastUrlSearch !== filters.search) {
    setLastUrlSearch(filters.search);
    setSearchDraft(filters.search);
  }

  const handleSearchDraft = (value: string) => {
    setSearchDraft(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 400);
  };

  // Nilai slider: 0 dianggap "tanpa batas" supaya tidak ada posisi mati (filter 0 = hasil kosong).
  const sliderValue = filters.maxHarga ?? 0;

  const hasActiveFilter =
    !!filters.search ||
    (!lockedKategori && !!filters.kategori) ||
    (!lockedTier && !!filters.tier) ||
    filters.maxHarga !== null;

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* ==== Keyword ==== */}
      <section aria-label="Filter kata kunci">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Kata Kunci
        </h3>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden
          />
          <Input
            type="search"
            value={searchDraft}
            onChange={(e) => handleSearchDraft(e.target.value)}
            placeholder="Cari barang lelang..."
            aria-label="Kata kunci"
            className="h-9 border-slate-800 bg-slate-950 pl-9 text-sm text-slate-100 placeholder:text-slate-600 focus-visible:border-amber-400/60 focus-visible:ring-amber-400/30 [&::-webkit-search-cancel-button]:hidden"
          />
        </div>
      </section>

      {/* ==== Kategori ==== */}
      <section aria-label="Filter kategori">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
          Kategori
          {lockedKategori && (
            <Lock className="h-3 w-3 text-amber-400/80" aria-label="Kategori terkunci" />
          )}
        </h3>
        {kategoriLoading ? (
          <div className="flex flex-col gap-1.5" aria-hidden>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-md bg-slate-800/70" />
            ))}
          </div>
        ) : (
          <div className="flex max-h-64 flex-col gap-1 overflow-y-auto pr-1 scrollbar-thin">
            {lockedKategori ? (
              <div className="rounded-md border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm font-medium text-amber-300">
                {lockedKategori}
                <p className="mt-0.5 text-[11px] font-normal text-amber-400/70">
                  Dikunci dari halaman kategori
                </p>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onKategoriChange("")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
                    filters.kategori === ""
                      ? "bg-slate-800 font-semibold text-amber-300"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  )}
                >
                  <span>Semua Kategori</span>
                </button>
                {kategoriList.map((item) => (
                  <button
                    key={item.kategori}
                    type="button"
                    onClick={() => onKategoriChange(item.kategori)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
                      filters.kategori === item.kategori
                        ? "bg-slate-800 font-semibold text-amber-300"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    )}
                  >
                    <span className="truncate">{item.kategori}</span>
                    <span
                      className={cn(
                        "ml-2 shrink-0 rounded-full px-1.5 py-0.5 text-[10px]",
                        filters.kategori === item.kategori
                          ? "bg-amber-400/20 text-amber-300"
                          : "bg-slate-800 text-slate-500"
                      )}
                    >
                      {item.count}
                    </span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </section>

      {/* ==== Tier ==== */}
      <section aria-label="Filter tier">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Tier Diskon
          {lockedTier && (
            <Lock className="ml-1 inline h-3 w-3 text-amber-400/80" aria-label="Tier terkunci" />
          )}
        </h3>
        {lockedTier ? (
          <div
            className={cn(
              "rounded-md border px-3 py-2 text-sm font-semibold",
              getTierMeta(lockedTier).badgeClass
            )}
          >
            Tier {lockedTier} — {getTierMeta(lockedTier).label}
            <p className="mt-0.5 text-[11px] font-normal opacity-70">
              Dikunci dari halaman tier
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onTierChange("")}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                filters.tier === ""
                  ? "border-amber-400/50 bg-amber-400/15 text-amber-300"
                  : "border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200"
              )}
            >
              Semua
            </button>
            {TIER_ORDER.map((tier) => {
              const meta = getTierMeta(tier);
              const active = filters.tier === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => onTierChange(tier)}
                  title={`${tier} — ${meta.label}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                    active
                      ? meta.badgeClass
                      : "border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", meta.dotClass)} aria-hidden />
                  {tier}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ==== Max harga ==== */}
      <section aria-label="Filter harga maksimum">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Harga Maksimum
          </h3>
          <span className="text-xs font-semibold text-amber-300">
            {sliderValue === 0 ? "Semua harga" : `≤ ${formatRupiah(sliderValue)}`}
          </span>
        </div>
        <Slider
          value={[sliderValue]}
          min={0}
          max={MAX_HARGA_SLIDER}
          step={STEP_HARGA}
          onValueCommit={(values) => {
            const v = values?.[0] ?? 0;
            onMaxHargaChange(v > 0 ? v : null);
          }}
          aria-label="Harga maksimum"
          className="py-2 [&_[data-slot=slider-range]]:bg-amber-400"
        />
        <div className="mt-1 flex justify-between text-[10px] text-slate-600">
          <span>Rp0</span>
          <span>Rp500 jt</span>
        </div>
      </section>

      {/* ==== Reset ==== */}
      {hasActiveFilter && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Reset Filter
        </button>
      )}
    </div>
  );
}
