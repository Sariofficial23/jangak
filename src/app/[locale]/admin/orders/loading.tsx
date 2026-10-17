import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <Skeleton className="mb-5 h-8 w-48" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm">
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <div className="mt-2 flex gap-2">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
