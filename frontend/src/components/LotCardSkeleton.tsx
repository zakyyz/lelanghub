import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Skeleton satu kartu lot — bentuknya meniru LotCard persis. */
export function LotCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900",
        className
      )}
      aria-hidden
    >
      <Skeleton className="aspect-[4/3] w-full rounded-none bg-slate-800" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-3 w-1/3 bg-slate-800" />
        <Skeleton className="h-4 w-full bg-slate-800" />
        <Skeleton className="h-4 w-2/3 bg-slate-800" />
        <Skeleton className="h-6 w-1/2 bg-slate-800" />
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <Skeleton className="h-3 w-1/3 bg-slate-800" />
          <Skeleton className="h-3 w-1/4 bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

/** Grid penuh berisi skeleton kartu (dipakai sebagai fallback loading halaman browse). */
export function LotCardSkeletonGrid({
  count = 8,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: count }, (_, i) => (
        <LotCardSkeleton key={i} />
      ))}
    </div>
  );
}
