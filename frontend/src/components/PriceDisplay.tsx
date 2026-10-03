import { cn, formatDiskon, formatRupiah } from "@/lib/utils";

const MAIN_SIZE: Record<"md" | "lg" | "xl", string> = {
  md: "text-lg",
  lg: "text-2xl sm:text-3xl",
  xl: "text-3xl sm:text-4xl",
};

interface PriceDisplayProps {
  /** Harga lelang (utama, bold besar). */
  hargaLelang: number | null;
  /** Harga pasaran — dirender strikethrough kecil bila ada dan lebih besar dari harga lelang. */
  hargaPasaran?: number | null;
  /** Persen diskon — dirender sebagai chip "-50%" bila > 0. */
  diskonPersen?: number | null;
  size?: "md" | "lg" | "xl";
  /** Sembunyikan chip diskon (mis. di detail yang sudah menampilkan tier badge besar). */
  hideDiscountChip?: boolean;
  className?: string;
}

export function PriceDisplay({
  hargaLelang,
  hargaPasaran = null,
  diskonPersen = null,
  size = "md",
  hideDiscountChip = false,
  className,
}: PriceDisplayProps) {
  const showPasaran =
    hargaPasaran !== null &&
    hargaPasaran !== undefined &&
    (hargaLelang === null || hargaPasaran > hargaLelang);
  const showDiskon =
    !hideDiscountChip &&
    diskonPersen !== null &&
    diskonPersen !== undefined &&
    diskonPersen > 0;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span
        className={cn(
          "font-bold tracking-tight text-slate-50",
          MAIN_SIZE[size]
        )}
      >
        {formatRupiah(hargaLelang)}
      </span>
      {showPasaran && (
        <span className="text-xs text-slate-500 line-through sm:text-sm">
          {formatRupiah(hargaPasaran)}
        </span>
      )}
      {showDiskon && (
        <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
          {formatDiskon(diskonPersen)}
        </span>
      )}
    </div>
  );
}
