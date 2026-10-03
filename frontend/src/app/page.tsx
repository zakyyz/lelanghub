import { Suspense } from "react";
import { LotBrowser } from "@/components/LotBrowser";
import { LotCardSkeletonGrid } from "@/components/LotCardSkeleton";

/**
 * Homepage LelangHub.
 * LotBrowser adalah client component yang membaca filter dari URL query params,
 * sehingga dibungkus Suspense (keharusan useSearchParams di App Router).
 */
export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6">
          <LotCardSkeletonGrid count={8} />
        </div>
      }
    >
      <LotBrowser />
    </Suspense>
  );
}
