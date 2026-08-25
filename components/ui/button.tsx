import { cn } from '@/lib/utils/cn';
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * The site's only button. Note what is absent: no rounded-2xl, no shadow, no
 * gradient. Presence comes from the letterspaced mono label, the hairline, and
 * a press state that actually moves — `active:scale` at 0.985 is felt on a
 * thumb without looking like a toy.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  solid:
    'bg-paper text-void hover:bg-bone active:bg-sand border border-transparent',
  accent:
    'bg-ember text-void hover:bg-[oklch(0.70_0.1523_47.8)] active:bg-ember-deep border border-transparent',
  outline:
    'border border-hairline-strong text-ink hover:border-mist hover:bg-white/[0.03] active:bg-white/[0.06]',
  ghost: 'border border-transparent text-ink-muted hover:text-ink hover:bg-white/[0.04]',
  link: 'border-0 px-0 text-ink underline decoration-hairline-strong underline-offset-[0.35em] hover:decoration-ember',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-micro',
  md: 'h-12 px-7 text-label',
  lg: 'h-14 px-9 text-label',
};

type ButtonProps<T extends ElementType> = {
  as?: T;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

export function Button<T extends ElementType = 'button'>({
  as,
  variant = 'outline',
  size = 'md',
  block = false,
  className,
  children,
  ...rest
}: ButtonProps<T>) {
  const Component = (as ?? 'button') as ElementType;
  return (
    <Component
      className={cn(
        'group relative inline-flex items-center justify-center gap-2.5',
        'font-mono uppercase tracking-[0.18em]',
        'transition-[background-color,border-color,color,transform] duration-(--duration-fast) ease-(--ease-out-quart)',
        'active:scale-[0.985] disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        variant !== 'link' && 'rounded-xs',
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
