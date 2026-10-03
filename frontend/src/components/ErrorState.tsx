"use client";

import { RefreshCw, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/** State error API: pesan + tombol retry. */
export function ErrorState({
  title = "Gagal Memuat Data",
  message = "Tidak dapat terhubung ke server API. Periksa koneksi Anda, lalu coba lagi.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-red-400/20 bg-red-400/5 px-6 py-16 text-center " +
        (className ?? "")
      }
      role="alert"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-red-400/30 bg-red-400/10 text-red-400">
        <ServerCrash className="h-8 w-8" aria-hidden />
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
        <p className="mx-auto max-w-md text-sm text-slate-500">{message}</p>
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          className="bg-amber-400 font-semibold text-slate-950 hover:bg-amber-300"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
