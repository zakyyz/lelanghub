import type { Metadata } from "next";
import { LotDetail } from "@/components/LotDetail";

interface LotPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: LotPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Detail Lot ${id}`,
    description:
      "Detail lot lelang: harga lelang, harga pasaran, tier diskon, uang jaminan, dan deadline.",
  };
}

export default async function LotPage({ params }: LotPageProps) {
  const { id } = await params;
  return <LotDetail id={id} />;
}
