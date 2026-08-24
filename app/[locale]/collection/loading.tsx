import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Collection skeleton.
 *
 * Deliberately matches the real grid's column counts, gaps and card aspect
 * ratio. A skeleton with the wrong geometry trades a blank frame for a layout
 * shift, which is the worse of the two.
 */
export default function CollectionLoading() {
  return (
    <main className="pt-28 lg:pt-36">
      <div className="editorial mb-12">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-6 h-14 w-72 sm:h-20" />
        <Skeleton className="mt-6 h-4 w-full max-w-md" />
      </div>
      <div className="editorial">
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="editorial mt-14 grid grid-cols-2 gap-x-4 gap-y-14 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-20">
        {Array.from({ length: 8 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
