"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { FilterSidebar, type ActiveFilters } from "@/components/FilterSidebar";
import { LotCard } from "@/components/LotCard";
import { LotCardSkeletonGrid } from "@/components/LotCardSkeleton";
import { Pagination } from "@/components/Pagination";
import { StatsBar } from "@/components/StatsBar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getKategori, getLots, getStats } from "@/lib/api";
import type { KategoriItem, LotsResponse, StatsResponse } from "@/types/lot";

const PAGE_LIMIT = 16;

interface LotBrowserProps {
  /** Kategori terkunci untuk halaman /kategori/[nama]. */
  lockedKategori?: string;
  /** Tier terkunci untuk halaman /tier/[tier]. */
  lockedTier?: string;
  /** Banner opsional di atas StatsBar (mis. judul kategori/tier). */
  banner?: React.ReactNode;
}

/**
 * Seluruh logika halaman browse (homepage, kategori, tier):
 * - Membaca filter dari URL query params (?search=&kategori=&tier=&max_harga=&page=)
 *   sehingga SEMUA kombinasi filter punya link yang bisa di-share.
 * - Fetch terpusat lewat lib/api.ts, diorkestrasi TanStack Query
 *   (loading skeleton, error + retry, dan keepPreviousData untuk pagination halus).
 * - Layout: StatsBar, sidebar filter (desktop) / drawer Sheet (mobile), grid kartu, pagination.
 */
export function LotBrowser({ lockedKategori, lockedTier, banner }: LotBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ==== Filter dari URL ====
  const search = searchParams.get("search") ?? "";
  const kategoriParam = searchParams.get("kategori") ?? "";
  const tierParam = searchParams.get("tier") ?? "";
  const maxHargaParam = searchParams.get("max_harga");
  const pageParam = searchParams.get("page");

  const effectiveKategori = lockedKategori ?? kategoriParam;
  const effectiveTier = lockedTier ?? tierParam;

  const maxHarga = useMemo(() => {
    if (!maxHargaParam) return null;
    const n = Number(maxHargaParam);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [maxHargaParam]);

  const page = useMemo(() => {
    const n = parseInt(pageParam ?? "1", 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [pageParam]);

  // ==== Server state via TanStack Query ====
  const lotsQuery = useQuery({
    queryKey: [
      "lots",
      search,
      effectiveKategori,
      effectiveTier,
      maxHarga,
      page,
    ],
    queryFn: ({ signal }) =>
      getLots(
        {
          page,
          limit: PAGE_LIMIT,
          search: search || undefined,
          kategori: effectiveKategori || undefined,
          tier: effectiveTier || undefined,
          max_harga: maxHarga ?? undefined,
        },
        { signal }
      ),
    placeholderData: keepPreviousData,
  });

  const statsQuery = useQuery({
    queryKey: ["stats"],
    queryFn: ({ signal }) => getStats({ signal }),
  });

  const kategoriQuery = useQuery({
    queryKey: ["kategori"],
    queryFn: ({ signal }) => getKategori({ signal }),
  });

  const lots: LotsResponse | null = lotsQuery.data ?? null;
  const loading = lotsQuery.isPending;
  const error = lotsQuery.isError
    ? lotsQuery.error instanceof Error
      ? lotsQuery.error.message
      : "Terjadi kesalahan tak terduga."
    : null;

  const stats: StatsResponse | null = statsQuery.data ?? null;
  const kategoriList: KategoriItem[] = kategoriQuery.data ?? [];
  const metaError = statsQuery.isError || kategoriQuery.isError;

  const [sheetOpen, setSheetOpen] = useState(false);

  // ==== Update URL query params (filter shareable) ====
  const updateParams = useCallback(
    (updates: Record<string, string | null>, opts?: { keepPage?: boolean }) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") sp.delete(key);
        else sp.set(key, value);
      }
      if (!opts?.keepPage) sp.delete("page"); // filter berubah -> kembali ke halaman 1
      const qs = sp.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: true });
    },
    [router, pathname, searchParams]
  );

  const handleSearchChange = useCallback(
    (value: string) => updateParams({ search: value.trim() || null }),
    [updateParams]
  );
  const handleKategoriChange = useCallback(
    (value: string) => updateParams({ kategori: value || null }),
    [updateParams]
  );
  const handleTierChange = useCallback(
    (value: string) => updateParams({ tier: value || null }),
    [updateParams]
  );
  const handleMaxHargaChange = useCallback(
    (value: number | null) =>
      updateParams({ max_harga: value === null ? null : String(value) }),
    [updateParams]
  );
  const handlePageChange = useCallback(
    (p: number) =>
      updateParams({ page: p > 1 ? String(p) : null }, { keepPage: true }),
    [updateParams]
  );
  const handleReset = useCallback(() => router.push(pathname), [router, pathname]);
  const handleRetry = useCallback(() => void lotsQuery.refetch(), [lotsQuery]);
  const handleMetaRetry = useCallback(() => {
    void statsQuery.refetch();
    void kategoriQuery.refetch();
  }, [statsQuery, kategoriQuery]);

  const filters: ActiveFilters = useMemo(
    () => ({ search, kategori: kategoriParam, tier: tierParam, maxHarga }),
    [search, kategoriParam, tierParam, maxHarga]
  );

  const activeFilterCount =
    (search ? 1 : 0) +
    (!lockedKategori && kategoriParam ? 1 : 0) +
    (!lockedTier && tierParam ? 1 : 0) +
    (maxHarga ? 1 : 0);

  const sidebar = (
    <FilterSidebar
      filters={filters}
      kategoriList={kategoriList}
      kategoriLoading={kategoriQuery.isPending}
      lockedKategori={lockedKategori}
      lockedTier={lockedTier}
      onSearchChange={handleSearchChange}
      onKategoriChange={handleKategoriChange}
      onTierChange={handleTierChange}
      onMaxHargaChange={handleMaxHargaChange}
      onReset={handleReset}
    />
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6">
      {banner}
      <StatsBar stats={stats} loading={statsQuery.isPending} className="mt-4" />

      <div className="mt-6 grid gap-8 lg:grid-cols-[270px_minmax(0,1fr)]">
        {/* ==== Sidebar filter (desktop) ==== */}
        <aside className="hidden lg:block" aria-label="Filter lot">
          <div className="sticky top-20 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            {sidebar}
            {metaError && (
              <button
                type="button"
                onClick={handleMetaRetry}
                className="mt-4 text-xs text-amber-400 underline-offset-2 hover:underline"
              >
                Sebagian data filter gagal dimuat — klik untuk muat ulang
              </button>
            )}
          </div>
        </aside>

        {/* ==== Konten utama ==== */}
        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-400" aria-live="polite">
              {loading
                ? "Memuat lot lelang..."
                : error
                  ? "Terjadi kesalahan."
                  : `${new Intl.NumberFormat("id-ID").format(lots?.total ?? 0)} lot ditemukan`}
            </p>
            <Button
              variant="outline"
              onClick={() => setSheetOpen(true)}
              className="shrink-0 border-slate-800 bg-slate-900 text-slate-200 hover:border-amber-400/40 hover:bg-slate-800 hover:text-amber-300 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              Filter
              {activeFilterCount > 0 && (
                <span className="ml-1 rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-slate-950">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {error ? (
            <ErrorState message={error} onRetry={handleRetry} />
          ) : loading ? (
            <LotCardSkeletonGrid count={8} />
          ) : !lots || lots.data.length === 0 ? (
            <EmptyState
              message={
                "Tidak ada lot yang cocok dengan kombinasi filter ini. Coba ubah kata kunci, tier, atau batas harga."
              }
              onReset={handleReset}
            />
          ) : (
            <div
              className={
                lotsQuery.isFetching ? "opacity-60 transition-opacity" : "transition-opacity"
              }
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {lots.data.map((lot) => (
                  <LotCard key={lot.id} lot={lot} />
                ))}
              </div>
              <Pagination
                page={lots.page}
                pages={lots.pages}
                total={lots.total}
                limit={lots.limit}
                onPageChange={handlePageChange}
                className="mt-10"
              />
            </div>
          )}
        </div>
      </div>

      {/* ==== Drawer filter (mobile) ==== */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="left"
          className="w-[320px] overflow-y-auto border-slate-800 bg-slate-950 sm:max-w-[320px]"
        >
          <SheetHeader className="pb-0">
            <SheetTitle className="text-slate-100">Filter Lelang</SheetTitle>
            <SheetDescription className="text-slate-500">
              Saring lot sesuai kebutuhanmu
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-8">
            {sidebar}
            {metaError && (
              <button
                type="button"
                onClick={handleMetaRetry}
                className="mt-4 text-xs text-amber-400 underline-offset-2 hover:underline"
              >
                Sebagian data filter gagal dimuat — klik untuk muat ulang
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <p className="mt-10 text-center text-[11px] text-slate-600">
        Butuh data tier lain?{" "}
        <Link href="/tier/S" className="text-amber-400/80 underline-offset-2 hover:underline">
          Lihat semua SUPER DEAL
        </Link>
      </p>
    </div>
  );
}
