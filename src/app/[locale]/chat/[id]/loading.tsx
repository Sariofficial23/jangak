import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="flex h-[calc(100dvh-4rem-var(--mobile-nav-height))] flex-col">
      <div className="flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-2">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-hidden px-4 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          <Skeleton className="h-10 w-40 self-start rounded-2xl" />
          <Skeleton className="h-10 w-48 self-end rounded-2xl" />
          <Skeleton className="h-16 w-52 self-start rounded-2xl" />
          <Skeleton className="h-10 w-36 self-end rounded-2xl" />
        </div>
      </div>
      <div className="border-t border-neutral-200 bg-white px-3 py-2">
        <Skeleton className="mx-auto h-11 max-w-2xl rounded-xl" />
      </div>
    </div>
  );
}
