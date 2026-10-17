import { Skeleton, ListingGridSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="mb-6 h-6 w-40" />
        <ListingGridSkeleton count={12} />
      </section>
    </>
  );
}
