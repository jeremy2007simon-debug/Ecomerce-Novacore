'use client';

import { AnimatePresence, type TargetAndTransition } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '@/lib/hooks/use-focus-trap';
import { useMounted } from '@/lib/hooks/use-mounted';
import { useScrollLock } from '@/lib/hooks/use-scroll-lock';
import { cn } from '@/lib/utils/cn';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * OVERLAY — the one modal primitive. Cart drawer, search, menu, assistant.
 *
 * PORTALS TO document.body, ALWAYS. This is not tidiness: `position: fixed` is
 * resolved against the nearest transformed ancestor, so an overlay rendered
 * inside an animated scene would position itself relative to that scene rather
 * than the viewport. Every scene on this site animates.
 *
 * No backdrop-filter on the scrim. A full-screen backdrop blur is the fastest
 * way to take an iPhone from 60fps to about 30 while anything moves behind it,
 * and blur over a moving scene reads as mush anyway. A near-opaque scrim looks
 * better and costs nothing.
 *
 * Accessibility is not optional here: labelled dialog role, focus trapped while
 * open, focus restored on close, Escape closes, and the rest of the app marked
 * `inert` so screen readers cannot wander out of the dialog.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type OverlayPlacement = 'right' | 'bottom' | 'full';

const PLACEMENT_CLASS: Record<OverlayPlacement, string> = {
  right: 'inset-y-0 right-0 w-full max-w-[27rem] border-l',
  bottom: 'inset-x-0 bottom-0 max-h-[88svh] rounded-t-lg border-t',
  full: 'inset-0',
};

const PLACEMENT_MOTION: Record<
  OverlayPlacement,
  { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }
> = {
  // A spring, not a tween: a drawer should arrive with a little weight.
  right: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
  bottom: { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } },
  // Full-screen surfaces scale rather than slide — sliding a whole viewport
  // reads as a page transition and confuses the back button's meaning.
  full: {
    initial: { opacity: 0, scale: 1.015 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.01 },
  },
};

export function Overlay({
  open,
  onClose,
  placement = 'right',
  label,
  id,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  placement?: OverlayPlacement;
  label: string;
  /** Lets a trigger button reference this panel via aria-controls. */
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  // createPortal needs document.body, which does not exist during SSR.
  const mounted = useMounted();

  useScrollLock(open);
  useFocusTrap(panelRef, open);

  // Escape closes. Registered on the document so it works regardless of where
  // focus currently sits inside the panel.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Hide the rest of the app from assistive tech while the dialog is open.
  useEffect(() => {
    if (!open) return;
    const root = document.getElementById('app-root');
    root?.setAttribute('inert', '');
    return () => root?.removeAttribute('inert');
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-(--z-overlay)" role="presentation">
          <m.div
            className="absolute inset-0 bg-void/85"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.25, 1, 0.5, 1] }}
            onClick={onClose}
          />

          <m.div
            ref={panelRef}
            id={id}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            className={cn(
              'absolute flex flex-col overflow-hidden border-hairline-strong bg-surface-raised outline-none',
              PLACEMENT_CLASS[placement],
              className,
            )}
            initial={PLACEMENT_MOTION[placement].initial}
            animate={PLACEMENT_MOTION[placement].animate}
            exit={PLACEMENT_MOTION[placement].exit}
            transition={
              placement === 'full'
                ? { duration: 0.26, ease: [0.16, 1, 0.3, 1] }
                : { type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }
            }
          >
            {children}
          </m.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
