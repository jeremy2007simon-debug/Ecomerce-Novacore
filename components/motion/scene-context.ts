'use client';

import { createContext, useContext } from 'react';
import type { MotionValue } from 'motion/react';

/**
 * One scroll subscription per scene, shared by every layer inside it.
 *
 * The alternative — each animated layer calling useScroll itself — means ten
 * layers register ten scroll listeners and perform ten independent range
 * calculations for the same element. Publishing one MotionValue through context
 * and deriving with useTransform costs one listener and no re-renders.
 */
export interface SceneContextValue {
  /** 0 → 1 across the scene's scroll range. */
  progress: MotionValue<number>;
  reduced: boolean;
  id: string;
}

export const SceneContext = createContext<SceneContextValue | null>(null);

export function useScene(): SceneContextValue {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error('useScene() must be called inside a <ScrollScene>');
  }
  return context;
}

/** Non-throwing variant, for components usable inside or outside a scene. */
export function useOptionalScene(): SceneContextValue | null {
  return useContext(SceneContext);
}
