import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <Skeleton className="mb-2 h-7 w-40" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
