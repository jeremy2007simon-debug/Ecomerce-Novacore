'use client';

import { createContext, useContext, type ReactNode } from 'react';

/**
 * IS_DEMO_MODE (lib/commerce/index.ts) is read from process.env.COMMERCE_PROVIDER
 * at module-eval time. That is safe from a Server Component — the check runs
 * on the server, where the real env var exists. It is NOT safe imported
 * directly into a Client Component: Next only inlines NEXT_PUBLIC_* vars into
 * the browser bundle, so a plain server var reads as undefined there, which
 * would make every client-side branch on IS_DEMO_MODE silently report "demo"
 * regardless of the real server configuration.
 *
 * The fix is the ordinary one for server-computed, request-invariant config a
 * client island needs: compute it once in a Server Component (the root
 * layout) and thread it down through this context, rather than each client
 * component reading the env var itself.
 */
const IsDemoModeContext = createContext<boolean>(true);

export function IsDemoModeProvider({ value, children }: { value: boolean; children: ReactNode }) {
  return <IsDemoModeContext.Provider value={value}>{children}</IsDemoModeContext.Provider>;
}

export function useIsDemoMode(): boolean {
  return useContext(IsDemoModeContext);
}
