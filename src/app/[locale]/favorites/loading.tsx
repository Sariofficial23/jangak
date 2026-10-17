import { Skeleton, ListingGridSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Skeleton className="mb-6 h-8 w-48" />
      <ListingGridSkeleton count={8} />
    </div>
  );
}
