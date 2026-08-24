import type { ReactNode } from 'react';

/** Content available to assistive tech but not painted. */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return (
    <span className="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip-path:inset(50%)]">
      {children}
    </span>
  );
}
