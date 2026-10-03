import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CountdownInfo } from "@/types/lot";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format angka menjadi Rupiah tanpa desimal: 2500000 -> "Rp2.500.000".
 * Aman terhadap null/undefined/NaN (mengembalikan "-").
 */
export function formatRupiah(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `Rp${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

/**
 * Format persen diskon: 50 -> "-50%".
 * Aman terhadap null/undefined (mengembalikan string kosong).
 */
export function formatDiskon(diskon: number | null | undefined): string {
  if (diskon === null || diskon === undefined || Number.isNaN(diskon)) return "";
  return `-${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(diskon)}%`;
}

/**
 * Format tanggal ISO "YYYY-MM-DD" menjadi format Indonesia panjang,
 * contoh: "8 Oktober 2026". Mengembalikan "-" bila tidak valid.
 */
export function formatDateID(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(d);
}

/**
 * PENTING: field `foto` dari API adalah JSON STRING berisi array URL,
 * bukan array langsung (contoh: "[\"url1\",\"url2\"]").
 * Fungsi ini parse dengan try/catch dan SELALU mengembalikan array string
 * yang valid (fallback array kosong bila kosong/rusak -> caller pakai placeholder).
 */
export function parseFoto(foto: string | null | undefined): string[] {
  if (!foto || typeof foto !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(foto);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is string => typeof item === "string" && item.trim() !== ""
      )
      .map((url) => {
        // Route lewat backend proxy untuk bypass hotlink protection (lelang.go.id dsb).
        if (url.includes("lelang.go.id") || url.includes("koelak.co.id") || url.includes("ibid.astra.co.id")) {
          const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
          return `${base}/api/proxy-image?url=${encodeURIComponent(url)}`;
        }
        return url;
      });
  } catch {
    return [];
  }
}

/** Cek apakah error berasal dari pembatalan fetch (AbortController). */
export function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (err instanceof Error && err.name === "AbortError")
  );
}

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/**
 * Hitung sisa waktu (hari/jam) menuju deadline.
 * - deadline kosong / tidak valid -> { valid: false } (jangan render countdown).
 * - deadline tanggal saja ("YYYY-MM-DD") dianggap berakhir akhir hari itu (23:59:59).
 * - expired bila waktu sudah lewat.
 * - urgent (merah) bila sisa < 3 hari.
 */
export function hitungCountdown(
  deadline: string | null | undefined,
  now: Date = new Date()
): CountdownInfo {
  const invalid: CountdownInfo = {
    valid: false,
    expired: false,
    urgent: false,
    days: 0,
    hours: 0,
  };
  if (!deadline || typeof deadline !== "string") return invalid;
  const target = new Date(
    deadline.length === 10 ? `${deadline}T23:59:59` : deadline
  );
  if (Number.isNaN(target.getTime())) return invalid;

  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) {
    return { valid: true, expired: true, urgent: false, days: 0, hours: 0 };
  }
  const days = Math.floor(diffMs / DAY_MS);
  const hours = Math.floor((diffMs % DAY_MS) / HOUR_MS);
  return { valid: true, expired: false, urgent: days < 3, days, hours };
}
