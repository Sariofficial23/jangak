import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Skeleton className="mb-6 h-8 w-56" />
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    </div>
  );
}
