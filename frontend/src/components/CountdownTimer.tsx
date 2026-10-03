import { AlarmClock, CalendarX2 } from "lucide-react";
import { cn, hitungCountdown } from "@/lib/utils";

interface CountdownTimerProps {
  /** ISO date string dari API. Bisa string kosong — komponen tidak me-render apa pun. */
  deadline: string;
  className?: string;
  /** Tampilkan teks "Berakhir dalam" sebelum sisa waktu. */
  withPrefix?: boolean;
}

/**
 * Countdown sisa hari/jam menuju deadline.
 * - deadline kosong/tidak valid -> render null.
 * - sisa < 3 hari -> merah (urgent).
 * - sudah lewat -> "Lelang ditutup" abu-abu.
 */
export function CountdownTimer({
  deadline,
  className,
  withPrefix = false,
}: CountdownTimerProps) {
  const info = hitungCountdown(deadline);
  if (!info.valid) return null;

  if (info.expired) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium text-slate-500",
          className
        )}
      >
        <CalendarX2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Lelang ditutup
      </span>
    );
  }

  const timeLabel =
    info.days > 0
      ? `${info.days} hari ${info.hours} jam`
      : `${info.hours} jam`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium",
        info.urgent ? "text-red-400" : "text-slate-400",
        className
      )}
      title={`Berakhir pada ${deadline}`}
    >
      <AlarmClock className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {withPrefix && <span>Berakhir dalam</span>}
      <span>{timeLabel}</span>
    </span>
  );
}
