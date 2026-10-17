import { Skeleton, ListingGridSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <Skeleton className="h-16 w-16 shrink-0 rounded-full sm:h-20 sm:w-20" />
        <div className="flex min-w-0 flex-col gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <Skeleton className="mb-4 h-6 w-48" />
      <ListingGridSkeleton count={8} />
    </div>
  );
}
