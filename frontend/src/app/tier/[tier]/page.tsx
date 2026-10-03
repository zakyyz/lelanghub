import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LotBrowser } from "@/components/LotBrowser";
import { TierBadge } from "@/components/TierBadge";
import type { Tier } from "@/types/lot";

interface TierPageProps {
  params: Promise<{ tier: string }>;
}

const VALID_TIERS = ["S", "A", "B", "C", "D"] as const;

const TIER_DESCRIPTION: Record<Tier, string> = {
  S: "Diskon 70% atau lebih dari harga pasaran — deal terbaik, jangan dilewatkan.",
  A: "Diskon 50–69% dari harga pasaran — layak banget untuk dikejar.",
  B: "Diskon 30–49% dari harga pasaran — masih masuk akal untuk ditawar.",
  C: "Diskon 10–29% dari harga pasaran — margin tipis, survei dulu.",
  D: "Diskon di bawah 10% dari harga pasaran — sebaiknya dilewati.",
};

export async function generateMetadata({
  params,
}: TierPageProps): Promise<Metadata> {
  const { tier } = await params;
  return {
    title: `Tier ${tier.toUpperCase()}`,
    description: `Kumpulan lot lelang tier ${tier.toUpperCase()} beserta diskonnya terhadap harga pasaran.`,
  };
}

/**
 * Halaman browse dengan tier terkunci (pre-filter dari path URL).
 * Tier tidak valid -> 404.
 */
export default async function TierPage({ params }: TierPageProps) {
  const { tier: tierParam } = await params;
  const tier = tierParam.toUpperCase();

  if (!(VALID_TIERS as readonly string[]).includes(tier)) {
    notFound();
  }

  const banner = (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <TierBadge tier={tier} size="lg" />
        <p className="max-w-xl text-sm text-slate-400">
          {TIER_DESCRIPTION[tier as Tier]}
        </p>
      </div>
      <Link
        href="/"
        className="text-sm text-slate-400 underline-offset-4 transition-colors hover:text-amber-400 hover:underline"
      >
        Lihat semua tier
      </Link>
    </div>
  );

  return <LotBrowser lockedTier={tier} banner={banner} />;
}
