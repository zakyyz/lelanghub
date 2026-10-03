import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  message?: string;
  onReset?: () => void;
  className?: string;
}

/** State kosong: tidak ada lot ditemukan + tombol reset filter. */
export function EmptyState({
  title = "Tidak Ada Lot Ditemukan",
  message = "Coba ubah kata kunci atau longgarkan filter untuk melihat lebih banyak lelang.",
  onReset,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-16 text-center " +
        (className ?? "")
      }
      role="status"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-500">
        <PackageOpen className="h-8 w-8" aria-hidden />
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
        <p className="mx-auto max-w-sm text-sm text-slate-500">{message}</p>
      </div>
      {onReset && (
        <Button
          onClick={onReset}
          className="bg-amber-400 font-semibold text-slate-950 hover:bg-amber-300"
        >
          Reset Filter
        </Button>
      )}
    </div>
  );
}
