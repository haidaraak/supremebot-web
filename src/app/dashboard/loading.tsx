import { Skeleton, SkeletonPanel, SkeletonRegion, SkeletonRow, SkeletonStatCard } from "@/components/ui/Skeleton";

/**
 * Dashboard loading boundary.
 *
 * The overview suspends on `useSearchParams`, so without this it rendered
 * nothing at all while resolving. The shapes below follow the real bento layout
 * — 4-up stat strip, then a 6-column row, then the lower panels — so the page
 * does not jump when the data lands.
 */
export default function Loading() {
  return (
    <SkeletonRegion label="Loading dashboard" className="flex flex-col gap-8">
      <div>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-2.5 h-3 w-80" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-6">
        <SkeletonPanel className="min-h-[280px] lg:col-span-3" lines={6} />
        <SkeletonPanel className="lg:col-span-3" lines={4} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <SkeletonPanel key={i} lines={4} />
        ))}
      </div>

      <div className="rounded-[16px] border border-line bg-surface">
        <div className="border-b border-line px-4 py-3.5">
          <Skeleton className="h-3 w-28" />
        </div>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="border-b border-line last:border-0">
            <SkeletonRow />
          </div>
        ))}
      </div>
    </SkeletonRegion>
  );
}
