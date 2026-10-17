import { Skeleton, ListingGridSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <Skeleton className="mx-auto mb-8 h-8 w-56" />
        <div className="mb-12 grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-16 w-16 rounded-full sm:h-20 sm:w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
        <ListingGridSkeleton count={8} />
      </section>
    </>
  );
}
