import Link from "next/link";
import { Gavel } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getTierMeta } from "@/components/TierBadge";
import { cn } from "@/lib/utils";
import type { StatsResponse } from "@/types/lot";

const TIER_ORDER = ["S", "A", "B", "C", "D"] as const;

interface StatsBarProps {
  stats: StatsResponse | null;
  loading?: boolean;
  className?: string;
}

/**
 * Bar statistik dari /api/stats: total lot aktif + jumlah per tier.
 * Chip tier dapat diklik menuju halaman /tier/{tier}.
 */
export function StatsBar({ stats, loading = false, className }: StatsBarProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4",
          className
        )}
        aria-hidden
      >
        <div className="flex flex-col gap-1">
          <Skeleton className="h-8 w-16 bg-slate-800" />
          <Skeleton className="h-3 w-24 bg-slate-800" />
        </div>
        <div className="hidden h-10 w-px bg-slate-800 sm:block" />
        <div className="flex flex-wrap gap-2">
          {TIER_ORDER.map((t) => (
            <Skeleton key={t} className="h-7 w-20 rounded-full bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <section
      className={cn(
        "flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4",
        className
      )}
      aria-label="Statistik lot lelang"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/15 text-amber-400">
          <Gavel className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <div className="text-2xl font-bold leading-none text-slate-50">
            {new Intl.NumberFormat("id-ID").format(stats.total_lots)}
          </div>
          <div className="mt-1 text-xs text-slate-400">Total Lot Aktif</div>
        </div>
      </div>

      <div className="hidden h-10 w-px bg-slate-800 sm:block" aria-hidden />

      <nav className="flex flex-wrap items-center gap-2" aria-label="Filter tier">
        {TIER_ORDER.map((tier) => {
          const count = stats.by_tier?.[tier] ?? 0;
          if (count === 0) return null;
          const meta = getTierMeta(tier);
          return (
            <Link
              key={tier}
              href={`/tier/${tier}`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1 text-xs font-semibold transition-colors hover:border-slate-600",
                meta.textClass
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", meta.dotClass)} aria-hidden />
              Tier {tier}
              <span className="rounded-full bg-slate-800 px-1.5 text-[10px] text-slate-300">
                {count}
              </span>
            </Link>
          );
        })}
        {typeof stats.by_tier === "object" &&
          !TIER_ORDER.some((t) => (stats.by_tier?.[t] ?? 0) > 0) && (
            <span className="text-xs text-slate-500">Belum ada lot bertier</span>
          )}
      </nav>
    </section>
  );
}
