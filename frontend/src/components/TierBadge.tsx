import { cn } from "@/lib/utils";
import type { Tier } from "@/types/lot";

/**
 * Konfigurasi warna & label per tier sesuai spesifikasi:
 * S = amber (gold) SUPER DEAL, A = emerald WORTH IT, B = blue LUMAYAN,
 * C = slate TIPIS, D = red SKIP, null = abu-abu muda BELUM DINILAI.
 */
export interface TierMeta {
  letter: string;
  label: string;
  /** Warna chip badge. */
  badgeClass: string;
  /** Warna teks saja (dipakai tombol filter / chart). */
  textClass: string;
  /** Warna dot kecil. */
  dotClass: string;
}

const TIER_META: Record<Tier | "NONE", TierMeta> = {
  S: {
    letter: "S",
    label: "SUPER DEAL",
    badgeClass:
      "border-amber-400/40 bg-amber-400/10 text-amber-400",
    textClass: "text-amber-400",
    dotClass: "bg-amber-400",
  },
  A: {
    letter: "A",
    label: "WORTH IT",
    badgeClass:
      "border-emerald-400/40 bg-emerald-400/10 text-emerald-400",
    textClass: "text-emerald-400",
    dotClass: "bg-emerald-400",
  },
  B: {
    letter: "B",
    label: "LUMAYAN",
    badgeClass: "border-blue-400/40 bg-blue-400/10 text-blue-400",
    textClass: "text-blue-400",
    dotClass: "bg-blue-400",
  },
  C: {
    letter: "C",
    label: "TIPIS",
    badgeClass: "border-slate-400/40 bg-slate-400/10 text-slate-400",
    textClass: "text-slate-400",
    dotClass: "bg-slate-400",
  },
  D: {
    letter: "D",
    label: "SKIP",
    badgeClass: "border-red-400/40 bg-red-400/10 text-red-400",
    textClass: "text-red-400",
    dotClass: "bg-red-400",
  },
  NONE: {
    letter: "?",
    label: "BELUM DINILAI",
    badgeClass:
      "border-slate-600/60 bg-slate-800/80 text-slate-300",
    textClass: "text-slate-300",
    dotClass: "bg-slate-500",
  },
};

/** Ambil meta tier. Menerima null/undefined/string tak dikenal -> NONE. */
export function getTierMeta(tier: string | null | undefined): TierMeta {
  if (!tier) return TIER_META.NONE;
  const upper = tier.toUpperCase() as Tier;
  return TIER_META[upper] ?? TIER_META.NONE;
}

const SIZE_CLASS: Record<"sm" | "md" | "lg", string> = {
  sm: "px-1.5 py-0.5 text-[9px] gap-1",
  md: "px-2 py-0.5 text-[10px] gap-1",
  lg: "px-2.5 py-1 text-xs gap-1.5",
};

interface TierBadgeProps {
  tier: string | null | undefined;
  size?: "sm" | "md" | "lg";
  /** Sembunyikan huruf tier (mis. di overlay kartu yang sudah sempit). */
  hideLetter?: boolean;
  className?: string;
}

export function TierBadge({
  tier,
  size = "md",
  hideLetter = false,
  className,
}: TierBadgeProps) {
  const meta = getTierMeta(tier);
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border font-semibold uppercase tracking-wide whitespace-nowrap",
        SIZE_CLASS[size],
        meta.badgeClass,
        className
      )}
      title={meta.label}
    >
      {!hideLetter && <span className="font-bold">{meta.letter}</span>}
      <span>{meta.label}</span>
    </span>
  );
}
