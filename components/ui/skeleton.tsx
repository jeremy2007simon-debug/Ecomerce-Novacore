import { cn } from '@/lib/utils/cn';

/**
 * Opacity pulse, not a shimmer sweep — a travelling gradient highlight is a
 * 2019 tell and it repaints a large area every frame.
 *
 * Skeletons must be given the EXACT geometry of the content they stand in for.
 * A skeleton that is the wrong height trades a blank frame for a layout shift,
 * which is the worse of the two.
 */
export function Skeleton({
  className,
  radius = 'xs',
}: {
  className?: string;
  radius?: 'none' | 'xs' | 'sm' | 'pill';
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-[atl-pulse-soft_1.6s_ease-in-out_infinite] bg-white/[0.045]',
        radius === 'xs' && 'rounded-xs',
        radius === 'sm' && 'rounded-sm',
        radius === 'pill' && 'rounded-pill',
        className,
      )}
    />
  );
}

/** Skeleton matching the collection card's exact aspect ratio and label stack. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="aspect-4/5 w-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
