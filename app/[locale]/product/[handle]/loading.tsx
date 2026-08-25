import { Skeleton } from '@/components/ui/skeleton';

/**
 * PDP skeleton, matching the opening section's two-column geometry.
 *
 * The title block is sized with the SAME expression as the real h1
 * (`clamp(2.5rem, 17cqi, 8.5rem)` at `line-height: 0.9`) inside the same
 * `@container` column, so the placeholder is exactly as tall as the type that
 * replaces it. It previously reserved 56px — 80px from `sm:` — for a headline
 * that renders up to 136px, and every entry into a product page shifted the
 * whole column downwards as the real title arrived.
 */
export default function ProductLoading() {
  return (
    <main className="editorial grid gap-12 pt-28 pb-(--spacing-section) lg:grid-cols-2 lg:gap-20 lg:pt-36">
      <Skeleton className="aspect-4/5 w-full" />
      <div className="@container flex flex-col">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-6 h-[calc(clamp(2.5rem,17cqi,8.5rem)*0.9)] w-4/5" />
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
