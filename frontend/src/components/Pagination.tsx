"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Daftar nomor halaman dengan elipsis, mis: 1 … 4 5 6 … 12 */
function buildPageList(page: number, pages: number): (number | "ellipsis")[] {
  if (pages <= 7) {
    return Array.from({ length: pages }, (_, i) => i + 1);
  }
  const wanted = new Set(
    [1, 2, page - 1, page, page + 1, pages - 1, pages].filter(
      (p) => p >= 1 && p <= pages
    )
  );
  const sorted = Array.from(wanted).sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) result.push("ellipsis");
    result.push(p);
    prev = p;
  }
  return result;
}

export function Pagination({
  page,
  pages,
  total,
  limit,
  onPageChange,
  className,
}: PaginationProps) {
  if (pages <= 1) return null;

  const showingFrom = (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, total);

  return (
    <nav
      className={cn("flex flex-col items-center gap-3", className)}
      aria-label="Navigasi halaman"
    >
      <p className="text-xs text-slate-500">
        Menampilkan{" "}
        <span className="font-semibold text-slate-300">
          {new Intl.NumberFormat("id-ID").format(showingFrom)}–
          {new Intl.NumberFormat("id-ID").format(showingTo)}
        </span>{" "}
        dari{" "}
        <span className="font-semibold text-slate-300">
          {new Intl.NumberFormat("id-ID").format(total)}
        </span>{" "}
        lot
      </p>
      <ul className="flex items-center gap-1.5">
        <li>
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Halaman sebelumnya"
            className="border-slate-800 bg-slate-900 hover:border-amber-400/40 hover:bg-slate-800 hover:text-amber-300"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Button>
        </li>
        {buildPageList(page, pages).map((item, idx) =>
          item === "ellipsis" ? (
            <li
              key={`ellipsis-${idx}`}
              className="px-1 text-xs text-slate-600"
              aria-hidden
            >
              …
            </li>
          ) : (
            <li key={item}>
              <Button
                variant={item === page ? "default" : "outline"}
                size="icon"
                onClick={() => item !== page && onPageChange(item)}
                aria-label={`Halaman ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={cn(
                  item === page
                    ? "bg-amber-400 font-bold text-slate-950 hover:bg-amber-300"
                    : "border-slate-800 bg-slate-900 hover:border-amber-400/40 hover:bg-slate-800 hover:text-amber-300"
                )}
              >
                {item}
              </Button>
            </li>
          )
        )}
        <li>
          <Button
            variant="outline"
            size="icon"
            disabled={page >= pages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Halaman berikutnya"
            className="border-slate-800 bg-slate-900 hover:border-amber-400/40 hover:bg-slate-800 hover:text-amber-300"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </li>
      </ul>
    </nav>
  );
}
