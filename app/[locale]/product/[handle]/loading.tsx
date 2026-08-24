import { Skeleton } from '@/components/ui/skeleton';

/** PDP skeleton, matching the opening section's two-column geometry. */
export default function ProductLoading() {
  return (
    <main className="editorial grid gap-12 pt-28 lg:grid-cols-2 lg:gap-20 lg:pt-36">
      <Skeleton className="aspect-4/5 w-full" />
      <div className="flex flex-col">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-6 h-14 w-64 sm:h-20" />
        <Skeleton className="mt-4 h-5 w-48" />
        <Skeleton className="mt-7 h-8 w-32" />
        <div className="mt-8 flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="mt-12 h-9 w-40" radius="pill" />
        <Skeleton className="mt-8 h-14 w-full" />
      </div>
    </main>
  );
}
