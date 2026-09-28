import { Skeleton, SkeletonPanel, SkeletonRegion, SkeletonStatCard } from "@/components/ui/Skeleton";

/**
 * Root loading boundary. Mirrors the landing page's opening rhythm — heading
 * block, stat strip, then panels — so the marketing page does not reflow when
 * its client components hydrate.
 */
export default function Loading() {
  return (
    <SkeletonRegion label="Loading" className="mx-auto max-w-[1240px] px-5 py-24 sm:px-8">
      <Skeleton className="h-4 w-40 rounded-full" />
      <Skeleton className="mt-7 h-14 w-full max-w-2xl" />
      <Skeleton className="mt-4 h-14 w-full max-w-xl" />
      <Skeleton className="mt-8 h-12 w-56" />

      <div className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <SkeletonPanel className="lg:col-span-2" lines={4} />
        <SkeletonPanel lines={4} />
      </div>
    </SkeletonRegion>
  );
}
