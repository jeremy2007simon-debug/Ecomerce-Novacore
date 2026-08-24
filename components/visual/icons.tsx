import { cn } from '@/lib/utils/cn';
import type { SVGProps } from 'react';

/**
 * A closed icon set: twelve glyphs, all drawn on the same 20px grid with a
 * single 1.35px stroke, square caps, and no filled shapes.
 *
 * Shipping a general-purpose icon library would be smaller effort and larger
 * cost — Heroicons' rounded 1.5px style is instantly recognisable and would
 * date the whole interface. Consistency of stroke and terminal is most of what
 * makes an icon set look commissioned.
 */

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function Icon({ className, children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={cn('size-5 shrink-0', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconSearch = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="8.75" cy="8.75" r="5.25" />
    <path d="M12.7 12.7 16.5 16.5" />
  </Icon>
);

export const IconBag = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.75 6.25h12.5l-.9 10.25H4.65z" />
    <path d="M7.25 8.25V5.6a2.75 2.75 0 0 1 5.5 0v2.65" />
  </Icon>
);

export const IconMenu = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6.5h14M3 13.5h14" />
  </Icon>
);

export const IconClose = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.75 4.75 15.25 15.25M15.25 4.75 4.75 15.25" />
  </Icon>
);

export const IconArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 10h13M11.5 5l5 5-5 5" />
  </Icon>
);

export const IconArrowDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 3.5v13M5 11.5l5 5 5-5" />
  </Icon>
);

export const IconCheck = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 10.4 8.2 14.6 16 5.8" />
  </Icon>
);

export const IconMinus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 10h11" />
  </Icon>
);

export const IconPlus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 10h11M10 4.5v11" />
  </Icon>
);

export const IconSpark = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 2.5v5M10 12.5v5M2.5 10h5M12.5 10h5" />
    <path d="M5.4 5.4 7.9 7.9M12.1 12.1l2.5 2.5M14.6 5.4 12.1 7.9M7.9 12.1 5.4 14.6" opacity="0.45" />
  </Icon>
);

export const IconGlobe = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10" cy="10" r="6.75" />
    <path d="M3.4 10h13.2" />
    <ellipse cx="10" cy="10" rx="3.1" ry="6.75" />
  </Icon>
);

export const IconTruck = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 5.5h9v8h-9zM11.5 8.5h3.2l2.8 3v2h-6z" />
    <circle cx="6" cy="15" r="1.4" />
    <circle cx="14" cy="15" r="1.4" />
  </Icon>
);

export const IconStar = (p: IconProps) => (
  <Icon {...p}>
    <path d="m10 2.6 2.3 4.9 5.2.7-3.8 3.7.95 5.3L10 14.7l-4.65 2.5.95-5.3L2.5 8.2l5.2-.7z" />
  </Icon>
);
